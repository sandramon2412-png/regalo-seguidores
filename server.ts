import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Process PDF text and generate study materials
app.post('/api/process', async (req, res) => {
  const { text, filename } = req.body as { text: string; filename: string };

  if (!text || text.trim().length < 100) {
    return res.status(400).json({ error: 'No se pudo extraer texto del PDF.' });
  }

  // Limit text to avoid excessive token usage (~50k chars ≈ 12k tokens)
  const truncated = text.length > 60000 ? text.slice(0, 60000) + '\n\n[... contenido adicional ...]' : text;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `Eres un experto en preparación de exámenes para Telus Digital (empresa de verificación y calidad de datos). Analiza el siguiente material de estudio y responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin explicaciones extras).

El JSON debe tener exactamente esta estructura:
{
  "summary": "Resumen del material en 3-4 oraciones claras",
  "topics": ["tema 1", "tema 2", "tema 3", "tema 4", "tema 5"],
  "questions": [
    {
      "question": "Pregunta de examen clara y específica",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 0,
      "explanation": "Por qué esta respuesta es correcta",
      "topic": "Tema relacionado"
    }
  ]
}

Genera exactamente 25 preguntas de práctica tipo examen basadas en el contenido real del material. Las preguntas deben cubrir diferentes temas del documento. El campo "correct" es el índice (0-3) de la respuesta correcta en el array "options".

MATERIAL DE ESTUDIO (archivo: ${filename}):
${truncated}

Responde SOLO con el JSON válido, sin texto adicional.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return res.status(500).json({ error: 'Sin respuesta del modelo.' });
    }

    // Extract JSON from the response
    let jsonStr = textBlock.text.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const data = JSON.parse(jsonStr);
    return res.json(data);
  } catch (err) {
    console.error('Error procesando PDF:', err);
    return res.status(500).json({ error: 'Error al generar preguntas. Verifica la API key.' });
  }
});

// Chat with the study assistant about the material
app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body as { message: string; context: string };

  if (!message) return res.status(400).json({ error: 'Mensaje requerido.' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const contextSnippet = context ? context.slice(0, 30000) : '';

    const stream = await client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      system: `Eres un asistente de estudio especializado en el examen de Telus Digital.
Ayudas a los estudiantes a entender el material de estudio y prepararse para el examen.
Responde en español, de forma clara y directa.
Si el usuario pregunta algo que está en el material de estudio, usa esa información.
Si no está en el material, usa tu conocimiento general sobre Telus Digital y verificación de datos.
${contextSnippet ? `\nMATERIAL DE ESTUDIO:\n${contextSnippet}` : ''}`,
      messages: [{ role: 'user', content: message }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Error en chat:', err);
    res.write(`data: ${JSON.stringify({ error: 'Error al conectar con el asistente.' })}\n\n`);
    res.end();
  }
});

// Generate more questions for a specific topic
app.post('/api/more-questions', async (req, res) => {
  const { topic, context } = req.body as { topic: string; context: string };

  if (!topic) return res.status(400).json({ error: 'Tema requerido.' });

  try {
    const contextSnippet = context ? context.slice(0, 40000) : '';

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Genera 10 preguntas adicionales de práctica para el examen de Telus Digital sobre el tema: "${topic}".

Responde ÚNICAMENTE con un array JSON válido:
[
  {
    "question": "Pregunta específica sobre ${topic}",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correct": 0,
    "explanation": "Explicación de la respuesta correcta",
    "topic": "${topic}"
  }
]

${contextSnippet ? `\nMATERIAL DE REFERENCIA:\n${contextSnippet}` : ''}

Responde SOLO con el JSON array, sin texto adicional.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return res.status(500).json({ error: 'Sin respuesta.' });
    }

    let jsonStr = textBlock.text.trim();
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const questions = JSON.parse(jsonStr);
    return res.json({ questions });
  } catch (err) {
    console.error('Error generando preguntas:', err);
    return res.status(500).json({ error: 'Error al generar preguntas.' });
  }
});

// Serve Vite build (always)
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`App corriendo en http://localhost:${PORT}`);
});
