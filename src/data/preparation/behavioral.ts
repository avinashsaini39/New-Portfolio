import type { Topic } from './types'

export const behavioral: Topic = {
  id: 'behavioral',
  title: 'Behavioural & Projects',
  group: 'Interview rounds',
  summary:
    'STAR stories and project walkthroughs built from your own resume. Prepare these out loud: they decide as many offers as the technical rounds.',
  questions: [
    {
      q: 'What is the STAR method?',
      level: 'basic',
      diagram: `
flowchart LR
  S["Situation"] --> T["Task"] --> A["Action (most time, say I)"] --> R["Result (numbers + lesson)"]
`,
      a: "A structure for answering 'tell me about a time...' questions:\n- Situation: the context, in one or two sentences.\n- Task: what you were responsible for.\n- Action: what you did, specifically. Say 'I', not 'we'. This should be the longest part.\n- Result: the outcome, with numbers if you have them, and what you learned.\n\nKeep each story under two minutes.",
    },
    {
      q: 'Tell me about yourself.',
      level: 'basic',
      a: "Aim for about 90 seconds: present, past, future.\n- Present: 'I'm a full-stack developer at EvolveNext, working on EasySocial.io, a WhatsApp automation and CRM platform used by 100+ businesses. I work across the React front end and Node.js services: chatbot flows, audience segmentation, campaign analytics and our shared component library.'\n- Past: 'Before that I built a MERN CRM with role-based access at Saumic Craft, and started as a frontend intern building pages from Figma designs. I also have an M.Tech in Computer Science.'\n- Side work: 'Outside work I build automation and AI tools, like an SEO audit platform with Playwright and BullMQ.'\n- Future: 'I'm looking for a full-stack role where I can own features end to end.'",
    },
    {
      q: 'Walk me through a project you are proud of.',
      level: 'mid',
      a: "Pick one (the SEO Analyzer or the AI Video Ad Generator) and cover:\n- The problem and who it's for.\n- The architecture: draw it (client, API, queue, workers, database).\n- Why you chose each technology (e.g. JSONB for flexible audit results, BullMQ for retries and priorities).\n- The hardest technical problem and how you solved it.\n- What you'd do differently or add next.\n\nExpect follow-up questions on every box you draw, so only draw what you can explain.",
    },
    {
      q: 'Describe the hardest bug you have fixed.',
      level: 'mid',
      a: "Choose a real one with a clear investigation. Structure:\n- The symptom and its impact (who was affected, how often).\n- How you narrowed it down: reproducing it, logs, adding measurements, forming and ruling out hypotheses.\n- The root cause (race condition, stale closure, missing index, timezone issue...).\n- The fix, and how you prevented it coming back (a test, monitoring, a lint rule).\n\nInterviewers care more about your debugging process than the bug itself.",
    },
    {
      q: 'Tell me about a time you improved performance.',
      level: 'mid',
      a: "You have two real examples:\n- Saumic Craft: API responses were slow; you rewrote slow MongoDB queries and added the right indexes. Explain how you found them (`explain()`, looking at COLLSCAN and documents examined), which index you added and why it matched the query, and the before and after timings.\n- SRV IT: pages reached 95+ Lighthouse performance scores through lazy loading and code splitting. Explain what was slow, what you changed and how you measured it.",
    },
    {
      q: 'Tell me about a disagreement with a teammate.',
      level: 'mid',
      a: "Show that you disagree respectfully and focus on the outcome. A good shape:\n- The disagreement was about an approach, not a person (e.g. building a custom component versus using a library one).\n- You listened to understand their reasons first.\n- You compared options with facts: a quick prototype, measurements, the trade-offs written down.\n- You agreed on a decision (maybe theirs), committed to it fully, and it worked out, or you both learned something.\n\nAvoid stories where you were simply right and they were wrong.",
    },
    {
      q: 'Tell me about a time you shipped under a tight deadline.',
      level: 'mid',
      a: "Focus on how you prioritised: splitting the feature into must-have and nice-to-have, agreeing on the reduced scope with your manager early, communicating progress and risks, and protecting quality where it mattered (not skipping validation or security). Mention what you followed up with afterwards to pay back any shortcuts.",
    },
    {
      q: 'Tell me about a mistake you made.',
      level: 'mid',
      a: "Pick a genuine, moderate mistake (not a disaster, not a fake one like 'I work too hard'). Own it without blaming others, explain how you fixed the immediate problem, and most importantly what you changed so it doesn't happen again: a checklist, a test, a review step, asking earlier. That last part is what they're listening for.",
    },
    {
      q: 'Why do you want to move from a frontend title to a full-stack role?',
      level: 'mid',
      a: "Answer with evidence, not just interest: 'My title is Frontend Developer, but I already work across the React front end and Node.js APIs at EasySocial, and I built an internal HR automation service in Node on my own. Before that I built a full MERN CRM with RBAC. My side projects are backend-heavy: queues, workers, PostgreSQL. I want a role where owning features from UI to database is the job, not the exception.'",
    },
    {
      q: 'Explain the HR automation service you built.',
      level: 'mid',
      a: "A good project story because it's backend-only and yours:\n- Problem: leave requests came by email and were tracked by hand.\n- Solution: a Node.js service that reads leave-request emails, uses the Gemini API to extract the details (who, dates, type, reason) into structured data, and posts them to managers on Discord with Approve and Reject buttons.\n- It records the decision and tracks leave status and employee records.\n- Talking points: validating the LLM's output against a schema (never trusting it blindly), handling ambiguous emails, idempotency if the same email is processed twice, and securing the Discord button interactions.",
    },
    {
      q: 'How do you use LLM APIs reliably in production?',
      level: 'mid',
      a: "From your content pipeline, video script and HR work:\n- Ask for structured output (JSON) and validate it with a schema; retry or fall back when it doesn't match.\n- Keep prompts versioned, and give examples of good output.\n- Run long generations in background jobs with retries and timeouts.\n- Break big tasks into stages (brief → outline → script) so each step is checkable and can be regenerated alone, as in the Video Ad Generator.\n- Track cost and latency, and cache results where inputs repeat.\n- Keep a human review step for anything customer-facing.",
    },
    {
      q: 'Where do you see yourself in a few years?',
      level: 'basic',
      a: "Keep it relevant to the role: growing into a senior full-stack engineer who owns larger systems end to end, gets deeper into backend architecture and reliability, and helps other developers through reviews and shared components. Show ambition that fits the company rather than a plan to leave.",
    },
    {
      q: 'What questions should you ask the interviewer?',
      level: 'basic',
      a: "Always ask two or three. Good ones:\n- 'What does a typical week look like for this role?'\n- 'How do you test and deploy? How often do you release?'\n- 'What's the biggest technical challenge the team faces right now?'\n- 'How are code reviews done, and how do new developers get feedback?'\n- 'What would success look like in the first three months?'",
    },
  ],
}
