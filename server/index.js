import express from 'express';
import multer from 'multer';
import { createWorker } from 'tesseract.js';
import Queue from 'bull';
import { createClient } from '@supabase/supabase-js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OCR queue
const ocrQueue = new Queue('ocr-processing', {
  redis: {
    host: 'localhost',
    port: 6379,
  }
});

// Initialize Tesseract worker
let worker = null;

async function initWorker() {
  worker = await createWorker('fra');
}

initWorker();

// Process OCR queue
ocrQueue.process(async (job) => {
  const { filePath, correctionId } = job.data;
  
  try {
    const { data: { text } } = await worker.recognize(filePath);
    
    // Call Mistral API
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{
          role: 'user',
          content: `Analyze this student's work:\n\n${text}`
        }],
        temperature: 0.7,
      }),
    });

    const mistralResponse = await response.json();
    const analysis = mistralResponse.choices[0].message.content;

    // Generate Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: analysis,
                size: 24,
              }),
            ],
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('corrections')
      .upload(`${correctionId}/correction.docx`, buffer);

    if (error) throw error;

    // Update correction status
    await supabase
      .from('corrections')
      .update({
        status: 'completed',
        result_url: data.path,
      })
      .eq('id', correctionId);

    return { success: true };
  } catch (error) {
    console.error('Processing error:', error);
    throw error;
  }
});

// API Routes
app.post('/process', upload.array('files'), async (req, res) => {
  try {
    const { correctionId } = req.body;
    
    for (const file of req.files) {
      await ocrQueue.add({
        filePath: file.path,
        correctionId,
      });
    }

    res.json({ message: 'Processing started' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});