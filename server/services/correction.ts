import { createWorker } from 'tesseract.js';
import Queue from 'bull';
import { supabase } from '../lib/supabase';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import config from '../config';
import { logger } from '../lib/logger';
import { AppError } from '../middleware/error';

interface ProcessCorrectionParams {
  files: Express.Multer.File[];
  correctionId: string;
  gradingCriteria: string;
  userId: string;
}

// Initialize OCR queue
const ocrQueue = new Queue('ocr-processing', {
  redis: config.redis
});

// Initialize Tesseract worker
let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function initWorker() {
  if (!worker) {
    logger.info('Initializing Tesseract worker...');
    worker = await createWorker('fra');
    logger.info('Tesseract worker initialized');
  }
  return worker;
}

async function extractTextFromImage(file: Express.Multer.File) {
  const worker = await initWorker();
  const { data: { text } } = await worker.recognize(file.buffer);
  return text;
}

async function callMistralAPI(prompt: string) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.mistral.apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new AppError(500, `Mistral API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWordDocument(correction: string) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: correction,
              size: 24,
            }),
          ],
        }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}

export async function processCorrection({
  files,
  correctionId,
  gradingCriteria,
  userId
}: ProcessCorrectionParams) {
  try {
    // Verify user has access to this correction
    const { data: correction, error: correctionError } = await supabase
      .from('corrections')
      .select('*')
      .eq('id', correctionId)
      .eq('user_id', userId)
      .single();

    if (correctionError || !correction) {
      throw new AppError(404, 'Correction not found');
    }

    // Add jobs to queue
    for (const file of files) {
      await ocrQueue.add({
        file: file.buffer.toString('base64'),
        correctionId,
        gradingCriteria,
        userId
      });
    }

    logger.info(`Added ${files.length} files to OCR queue for correction ${correctionId}`);
  } catch (error) {
    logger.error('Error processing correction:', error);
    throw error;
  }
}

// Process OCR queue
ocrQueue.process(async (job) => {
  const { file, correctionId, gradingCriteria, userId } = job.data;

  try {
    // Convert base64 back to buffer
    const fileBuffer = Buffer.from(file, 'base64');
    
    // Extract text using OCR
    const text = await extractTextFromImage({ buffer: fileBuffer } as Express.Multer.File);
    
    // Get AI analysis
    const analysis = await callMistralAPI(
      `Analyze this student's work with the following criteria:\n\n${gradingCriteria}\n\n${text}`
    );
    
    // Generate Word document
    const wordBuffer = await generateWordDocument(analysis);

    // Upload to Supabase
    const fileName = `${correctionId}/correction_${Date.now()}.docx`;
    const { error: uploadError } = await supabase.storage
      .from('corrections')
      .upload(fileName, wordBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('corrections')
      .getPublicUrl(fileName);

    // Update correction status
    const { error: updateError } = await supabase
      .from('corrections')
      .update({
        status: 'completed',
        result_url: publicUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', correctionId);

    if (updateError) {
      throw updateError;
    }

    logger.info(`Completed processing correction ${correctionId}`);
    return { success: true };
  } catch (error) {
    logger.error(`Error processing job ${job.id}:`, error);
    throw error;
  }
});