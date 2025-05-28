import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Document, Packer, Paragraph, TextRun } from 'npm:docx@8.5.0';
import { ImageAnnotatorClient } from 'npm:@google-cloud/vision@4.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Google Vision client
const vision = new ImageAnnotatorClient({
  credentials: JSON.parse(Deno.env.get('GOOGLE_VISION_CREDENTIALS') || '{}'),
});

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function extractTextFromFile(file: Blob): Promise<string> {
  try {
    const [result] = await vision.documentTextDetection({
      image: { content: await file.arrayBuffer() }
    });
    
    return result.fullTextAnnotation?.text || '';
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from file');
  }
}

async function generateMistralPrompt(
  studentText: string,
  perfectAnswer: string,
  gradingCriteria: string,
  classLevel: string
): Promise<string> {
  return `En tant que professeur expérimenté, je vais t'aider à corriger cette copie d'élève.

Contexte :
- Niveau de la classe : ${classLevel}
- Barème détaillé : ${gradingCriteria}

Copie de l'élève (texte OCRisé) :
${studentText}

Sujet parfait / Corrigé type :
${perfectAnswer}

Instructions pour la correction :
1. Analyse détaillée de la copie
2. Identification des points forts et des erreurs
3. Suggestions d'amélioration constructives
4. Attribution des points selon le barème fourni
5. Commentaire général sur la copie

Format de réponse souhaité :
1. ANALYSE DÉTAILLÉE :
[Analyse point par point de la copie]

2. POINTS FORTS :
[Liste des éléments positifs]

3. POINTS À AMÉLIORER :
[Liste des erreurs avec explications]

4. NOTATION DÉTAILLÉE :
[Détail des points attribués selon le barème]

5. COMMENTAIRE GÉNÉRAL :
[Synthèse et encouragements]

Merci de fournir une correction détaillée et constructive.`;
}

async function callMistralAPI(prompt: string): Promise<string> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWordDocument(correction: string): Promise<Buffer> {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { correctionId, classLevel, gradingCriteria } = await req.json();

    // Get correction files from storage
    const { data: studentCopies } = await supabaseClient.storage
      .from('student-copies')
      .list(correctionId);

    const { data: perfectAnswers } = await supabaseClient.storage
      .from('perfect-answers')
      .list(correctionId);

    if (!studentCopies?.length || !perfectAnswers?.length) {
      throw new Error('Missing required files');
    }

    // Process each student copy
    for (const copy of studentCopies) {
      // Download files
      const { data: studentFile } = await supabaseClient.storage
        .from('student-copies')
        .download(`${correctionId}/${copy.name}`);

      const { data: perfectFile } = await supabaseClient.storage
        .from('perfect-answers')
        .download(`${correctionId}/${perfectAnswers[0].name}`);

      if (!studentFile || !perfectFile) {
        throw new Error('Failed to download files');
      }

      // Extract text from files
      const studentText = await extractTextFromFile(studentFile);
      const perfectText = await extractTextFromFile(perfectFile);

      // Generate and send prompt to Mistral
      const prompt = await generateMistralPrompt(
        studentText,
        perfectText,
        gradingCriteria,
        classLevel
      );
      const correction = await callMistralAPI(prompt);

      // Generate Word document
      const wordBuffer = await generateWordDocument(correction);

      // Upload result
      const resultFileName = `${correctionId}/correction_${copy.name}.docx`;
      await supabaseClient.storage
        .from('corrections')
        .upload(resultFileName, wordBuffer);

      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('corrections')
        .getPublicUrl(resultFileName);

      // Update correction record
      await supabaseClient
        .from('corrections')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result_url: publicUrl,
        })
        .eq('id', correctionId);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});