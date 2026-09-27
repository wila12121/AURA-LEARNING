import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with telemetry header as required by guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to check API key
function verifyApiKey(res: Response): boolean {
  if (!apiKey) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please check your environment settings in the Secrets panel.',
    });
    return false;
  }
  return true;
}

// 1. Personalized Tutoring Stream (SSE)
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  if (!verifyApiKey(res)) return;

  const {
    messages = [],
    subject = 'General Learning',
    tutoringMode = 'socratic', // 'socratic' | 'explainer' | 'drill'
    depthLevel = 'academic',   // 'intuitive' | 'academic' | 'rigorous'
    studentContext = '',
  } = req.body;

  let modeInstruction = '';
  if (tutoringMode === 'socratic') {
    modeInstruction = `
You are a warm, inspiring Socratic tutor. DO NOT simply give away answers directly to complex problems. 
Instead:
- Gently validate the student's current reasoning and ask probing, targeted questions that guide them toward finding the answer themselves.
- Provide intuitive analogies and step-by-step scaffolding.
- When they are stuck, give them a subtle hint or break down the problem into a simpler sub-problem.
- When they arrive at the right insight, celebrate their deduction and summarize the foundational concept clearly.`;
  } else if (tutoringMode === 'explainer') {
    modeInstruction = `
You are a master conceptual educator. 
Explain with crystal clarity:
- Lead with an intuitive high-level mental model before diving into mechanics.
- Break down complex mechanisms into structured, sequential numbered stages.
- Highlight "Why this matters" and provide vivid analogies.
- Formulate mathematical or technical concepts with clear notation.
- End with 1-2 thoughtful follow-up questions to check comprehension.`;
  } else {
    modeInstruction = `
You are a high-yield exam drill tutor.
- Focus on active recall, common exam traps, and rapid conceptual diagnosis.
- Probe the student with realistic test scenarios and edge cases.
- Provide crisp, memorable mnemonics and high-yield bulleted summaries.`;
  }

  let depthInstruction = '';
  if (depthLevel === 'intuitive') {
    depthInstruction = 'Calibrate for Intuitive / Foundational: Use plain English, zero jargon without immediate visual analogy, intuitive everyday metaphors, and clear simple phrasing.';
  } else if (depthLevel === 'academic') {
    depthInstruction = 'Calibrate for Standard Academic / College Core: Maintain technical accuracy, introduce proper terminology with context, and explain mathematical/logical foundations clearly.';
  } else {
    depthInstruction = 'Calibrate for Rigorous / Advanced: Provide mathematical rigor, edge cases, underlying proofs/mechanisms, formal definitions, and research-level nuance.';
  }

  const systemInstruction = `You are AuraLearn, a personalized liquid AI learning tutor for students.
Domain / Subject: ${subject}
${modeInstruction}
${depthInstruction}
${studentContext ? `Additional Student Context: ${studentContext}` : ''}

Format responses with beautiful markdown:
- Use clean headings (###, ####), bullet points, and numbered steps.
- For math formulas, format clearly with standard symbols or block formulas.
- Include a brief "💡 Key Takeaway" at the end of substantive answers.
- Suggest 2 concise follow-up questions the student might want to ask next in a section labeled "🔮 Suggested Next Steps:".
Keep the tone encouraging, calm, respectful, and intellectually stimulating.`;

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    // Format conversation history for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello! Please introduce yourself and ask me what I would like to study today.' }],
      });
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error in chat stream:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Stream generation failed' })}\n\n`);
    res.end();
  }
});

// 2. Complex Question Deep Dive Engine
app.post('/api/explain-deep', async (req: Request, res: Response) => {
  if (!verifyApiKey(res)) return;

  const { question, subject = 'General Science & Humanities', depth = 'college' } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const prompt = `You are a world-class academic tutor. A student has asked this complex question:
Question: "${question}"
Subject Area: ${subject}
Academic Depth: ${depth}

Provide a comprehensive, pedagogical, and deeply structured breakdown of this question.
Return your response strictly in valid JSON adhering to this exact format:
{
  "title": "A concise, engaging title for this conceptual breakdown",
  "coreIntuition": "A 2-3 sentence intuitive explanation that even someone new can immediately grasp.",
  "formalSteps": [
    {
      "stepNumber": 1,
      "title": "Title of this logical step",
      "explanation": "Detailed step-by-step breakdown of how this works or is derived.",
      "formulaOrKeyConcept": "Optional formula, key equation, or core principle (or empty string)"
    }
  ],
  "realWorldAnalogy": "A tangible, relatable everyday analogy that anchors this concept in reality.",
  "commonPitfalls": [
    "Trap or misconception students frequently make, and why it is wrong"
  ],
  "practicalApplication": "Where this is applied in modern technology, nature, or real life.",
  "selfCheckChallenge": {
    "question": "A quick conceptual question to test if the student truly understood this concept.",
    "hint": "A subtle hint for the student.",
    "solution": "The complete correct answer and explanation."
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating deep dive:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate deep dive breakdown' });
  }
});

// 3. Adaptive Study Schedule Generator
app.post('/api/generate-schedule', async (req: Request, res: Response) => {
  if (!verifyApiKey(res)) return;

  const {
    subjects = [], // [{ name: string, examDate: string, priority: 'high'|'medium'|'low', difficulty: 'hard'|'medium'|'easy' }]
    weeklyHours = 14,
    daysPerWeek = 5,
    preferredTimeOfDay = 'evening',
    currentChallenges = '',
  } = req.body;

  const prompt = `Create an optimized, personalized 7-day study plan for a student based on cognitive science and spaced repetition principles (Ebbinghaus forgetting curve + Pomodoro distribution).

Student Study Profile:
- Weekly Available Hours: ${weeklyHours} hours
- Active Study Days: ${daysPerWeek} days per week
- Preferred Focus Window: ${preferredTimeOfDay}
- Subjects & Deadlines: ${JSON.stringify(subjects)}
- Current Challenges / Weaknesses: ${currentChallenges || 'None specified'}

Return strictly JSON format:
{
  "planTitle": "e.g. Adaptive 7-Day Spaced Repetition Blueprint",
  "overview": "A brief overview explaining the pedagogical strategy behind this schedule.",
  "dailyTargetHours": 2.5,
  "keyStrategies": ["3-4 evidence-based study tactics tailored to these subjects"],
  "days": [
    {
      "dayIndex": 0,
      "dayName": "Monday",
      "isRestDay": false,
      "focusSubject": "Subject Name",
      "dailyGoal": "Clear, measurable outcome for today",
      "sessions": [
        {
          "id": "s1",
          "subject": "Subject Name",
          "topic": "Specific Topic",
          "durationMinutes": 45,
          "technique": "Active Recall & Problem Sets",
          "tasks": ["Task 1", "Task 2"],
          "difficulty": "medium",
          "energyLevelRequired": "high"
        }
      ]
    }
  ],
  "spacedRepetitionCheckpoints": [
    {
      "dayOffset": 3,
      "topic": "Topic to recall",
      "description": "Quick 15-minute flashcard / recall drill to cement memory"
    }
  ]
}
Ensure there are exactly 7 days (Monday through Sunday). Distribute the ${weeklyHours} hours thoughtfully with built-in active recall and rest buffers.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating study schedule:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate study schedule' });
  }
});

// 4. Interactive Quiz & Active Recall Flashcard Generator
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  if (!verifyApiKey(res)) return;

  const { topic, subject = 'General', count = 4, difficulty = 'intermediate' } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  const prompt = `Generate an interactive active recall quiz of ${count} high-quality questions for a student learning:
Topic: "${topic}"
Subject: ${subject}
Difficulty: ${difficulty}

Focus on deep conceptual understanding, preventing common misunderstandings, and application rather than mere rote memorization.
Return strictly JSON format:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": "q1",
      "question": "Clear, thought-provoking question",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why the correct option is right and what makes the other options subtle traps.",
      "keyConcept": "1-sentence memory anchor"
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// 5. Open-ended Answer Evaluator
app.post('/api/evaluate-answer', async (req: Request, res: Response) => {
  if (!verifyApiKey(res)) return;

  const { question, studentAnswer, context = '' } = req.body;

  if (!question || !studentAnswer) {
    return res.status(400).json({ error: 'Both question and studentAnswer are required.' });
  }

  const prompt = `You are a supportive, insightful teacher evaluating a student's answer.
Question: "${question}"
Student's Answer: "${studentAnswer}"
Context/Subject: "${context}"

Provide an accurate, encouraging assessment in strictly JSON:
{
  "scorePercent": 85,
  "verdict": "Strong understanding with minor nuance missing",
  "strengths": ["What the student got completely right"],
  "misconceptionsOrGaps": ["Any misconceptions or missing details"],
  "improvedExplanation": "How to frame this answer with maximum precision and elegance",
  "encouragement": "A short, motivating closing thought"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return res.status(500).json({ error: error.message || 'Failed to evaluate answer' });
  }
});

// Mount Vite or static middleware
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraLearn full-stack server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
