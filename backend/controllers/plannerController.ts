import { Request, Response } from 'express';
import axios from 'axios';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { parseLangChainPlan } from '../services/generateCalendarEvents';

// -------- Generate Only --------
export const createPlan = async (req: Request, res: Response): Promise<void> => {
  const { goal, hoursPerDay, daysAvailable } = req.body;

  if (!goal || !hoursPerDay || !daysAvailable) {
    res.status(400).json({ error: 'Missing input fields' });
    return;
  }

  const prompt = new PromptTemplate({
    template: `You are a study planning assistant.
Create a personalized study plan for the goal: "{goal}".
The user can study for {hours} hours/day and is available on these days: {days}.

🛑 STRICT RULE:
Only generate a plan using the days listed in {days}. Do not include any other days.

✅ FORMAT:
Day 1 - <Day>:
- Task 1
- Task 2`,
    inputVariables: ['goal', 'hours', 'days'],
  });

  const model = new ChatOllama({
    baseUrl: 'http://localhost:11434',
    model: 'llama3',
  });

  const chain = prompt.pipe(model);

  try {
    const result = await chain.invoke({
      goal,
      hours: hoursPerDay,
      days: daysAvailable.join(', '),
    });

    const raw = typeof result.content === 'string' ? result.content : (result.content as any)?.text || '';
    const allowedDays = daysAvailable.map((d: string) => d.toLowerCase());
    const filteredPlan = raw
      .split('\n\n')
      .filter((block: string) => allowedDays.some((day: string) => block.toLowerCase().includes(day)))
      .join('\n\n');

    res.json({ plan: filteredPlan });
  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({ error: 'Failed to generate study plan', details: error });
  }
};

// -------- Generate + Sync --------
export const generateAndSyncPlan = async (req: Request, res: Response): Promise<void> => {
  const { goal, hoursPerDay, daysAvailable, access_token } = req.body;

  if (!goal || !hoursPerDay || !daysAvailable || !access_token) {
    res.status(400).json({ error: 'Missing input fields' });
    return;
  }

  const prompt = new PromptTemplate({
    template: `You are an AI study assistant.
  
  The user wants to study: "{goal}"  
  They are only available on: {days}  
  They can study for {hours} hours each day.
  
  🛑 STRICT RULES:
  - Only generate study days for the days listed in {days}.
  - Do NOT include any days not listed.
  - Do NOT number days across weeks (no \"Day 8\", \"Day 15\", etc.)
  - Just increment Day 1, Day 2, Day 3 in the order of the listed days.
  
  ✅ FORMAT:
  
  Day 1 - Tuesday:
  - Task 1
  - Task 2
  
  Day 2 - Friday:
  - Task 3
  - Task 4
  
  Keep it simple and concise. Do not plan over multiple weeks.`,
    inputVariables: ['goal', 'hours', 'days'],
  });
  
  const model = new ChatOllama({
    baseUrl: 'http://localhost:11434',
    model: 'llama3',
  });

  const chain = prompt.pipe(model);
  const result = await chain.invoke({
    goal,
    hours: hoursPerDay,
    days: daysAvailable.join(', '),
  });

  const rawPlan = Array.isArray(result.content)
    ? (result.content as any[]).map((c) => c.text || c || '').join('\n')
    : (typeof result.content === 'string' ? result.content : (result.content as any)?.text || '');

  const parsed = parseLangChainPlan(rawPlan, daysAvailable);

  const createdEvents: any[] = [];
  const today = new Date();

  for (let i = 0; i < parsed.length; i++) {
    let startHour = 10;

    for (const task of parsed[i].tasks) {
      const start = new Date(today);
      start.setDate(today.getDate() + i);
      start.setHours(startHour, 0, 0);

      const end = new Date(start.getTime() + 60 * 60 * 1000);

      try {
        const calendarRes = await axios.post('http://localhost:4000/api/calendar/sync', {
          access_token,
          eventDetails: {
            summary: task,
            description: goal,
            start: start.toISOString(),
            end: end.toISOString(),
          },
        });

        createdEvents.push(calendarRes.data.event);
      } catch (err: any) {
        console.error('❌ Calendar Sync Error:', err?.response?.data || err.message);
        res.status(500).json({
          error: 'Failed to sync a task to calendar',
          details: err?.response?.data || err.message,
        });
        return;
      }

      startHour += 1;
    }
  }

  res.json({
    message: 'All events synced to calendar!',
    plan: rawPlan,
    eventsCreated: createdEvents.length,
  });
};
