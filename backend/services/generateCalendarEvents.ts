export type TaskBlock = {
  day: string;
  tasks: string[];
};

export function parseLangChainPlan(planText: string, allowedDays: string[]): TaskBlock[] {
  const days = planText.split(/\n(?=Day \d+)/); // split by "Day X - ..."
  const parsed: TaskBlock[] = [];

  const normalizedDays = allowedDays.map(d => d.toLowerCase());

  for (const dayBlock of days) {
    const lines = dayBlock.trim().split('\n');
    const header = lines.shift(); // e.g., "Day 1 - Friday"

    if (!header) continue;

    const dayMatch = header.match(/Day \d+ - (\w+)/);
    const day = dayMatch ? dayMatch[1] : 'Unknown';

    const tasks = lines
      .map(line => line.trim().replace(/^[-*] /, '')) // clean "- " or "* "
      .filter(line => line.length > 0);

    if (tasks.length > 0 && normalizedDays.includes(day.toLowerCase())) {
      parsed.push({ day, tasks });
    }
  }

  return parsed;
}
