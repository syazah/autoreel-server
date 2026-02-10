import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";
import type { ProjectCategory } from "../types/project.js";

export const createStoryPromptMessages = (
    userPrompt: string,
    projectCategory: ProjectCategory
): ChatCompletionMessageParam[] => {
    const systemMessage = `
You are a short-form content planning engine.

Your job is to convert a rough user idea into a structured video script blueprint
for a social media video generation system.

You are NOT chatting with the user.
You are NOT writing an essay.
You are producing structured data.

The output will be parsed by a backend program.
Therefore correctness and JSON validity are critical.

INTERPRETATION RULES:
- If the user idea is vague, infer a clear topic.
- Do not ask questions.
- Do not refuse.
- Do not add commentary.
- Improve unclear ideas automatically.

VIDEO STRUCTURE:
Hook → Problem → Explanation → Resolution → Takeaway → Call to Action

WRITING RULES:
- narration must be short and natural
- maximum 18 words per narration line
- no emojis
- no quotes
- no numbering
- no hashtags inside narration

-----------------------------
OUTPUT REQUIREMENTS
-----------------------------

You MUST return ONLY valid JSON.

DO NOT:
- add explanations
- add markdown
- add code blocks
- add text before JSON
- add text after JSON

STRICT VALIDATION RULES:
- All fields required
- No empty strings
- No null values
- Do not rename keys
- Do not add keys
- segments: 3–7
- hashtags: 5–12
- estimated_total_duration: 12–60 seconds

FIELD DEFINITIONS:

title:
Short social media friendly title.

intent:
One sentence explaining why the viewer should watch.

hook.text:
First 2-second attention grabbing line.

hook.type must be EXACTLY one of:
question
shocking_fact
mistake
relatable_statement
story_start

message.main_message:
Core idea of the video.

message.problem:
Viewer’s problem.

message.resolution:
How the video helps.

message.takeaway:
Key lesson.

visual_idea:
Describe only what appears visually. No camera terms.

image_prompt_seed:
Detailed visual description usable for image generation.
Include subject, environment, and mood.

HASHTAGS:
- lowercase
- start with #
- no spaces

RETURN JSON USING EXACT SCHEMA:

{
  "title": "string",
  "intent": "string",
  "hook": {
    "text": "string",
    "type": "question | shocking_fact | mistake | relatable_statement | story_start"
  },
  "message": {
    "main_message": "string",
    "problem": "string",
    "resolution": "string",
    "takeaway": "string"
  },
  "segments": [
    {
      "order": 1,
      "narration": "string",
      "visual_idea": "string",
      "image_prompt_seed": "string"
    }
  ],
  "hashtags": ["#example"],
  "estimated_total_duration": 30
}
`;

    const userMessage = `
VIDEO CATEGORY: ${projectCategory}

CATEGORY GUIDELINES:
${getSystemPromptForCategory(projectCategory)}

USER IDEA:
"${userPrompt}"

Create the video script blueprint now.
`;

    return [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
    ];
};

const getSystemPromptForCategory = (projectCategory: ProjectCategory) => {
    switch (projectCategory) {
        case "Entertainment":
            return `
Audience age 6-12.
Very simple language.
Positive tone.
Clear moral lesson.
No scary or dark themes.
`;

        case "Educational":
            return `
Educational and factual.
Clear explanations.
Focus on usefulness.
Avoid dramatic storytelling.
`;

        case "Storytelling":
            return `Engaging narrative.`;
        case "Lifestyle":
            return `Relatable everyday topics.
Practical tips.
Authentic tone.
Focus on self-improvement.`;

        default:
            return `General audience short-form social media content.`;
    }
};

export const llmScriptSchema = {
    type: "object",
    additionalProperties: false,
    required: [
        "title",
        "intent",
        "hook",
        "message",
        "segments",
        "hashtags",
        "estimated_total_duration"
    ],
    properties: {
        title: { type: "string" },
        intent: { type: "string" },

        hook: {
            type: "object",
            additionalProperties: false,
            required: ["text", "type"],
            properties: {
                text: { type: "string" },
                type: {
                    type: "string",
                    enum: [
                        "question",
                        "shocking_fact",
                        "mistake",
                        "relatable_statement",
                        "story_start"
                    ]
                }
            }
        },

        message: {
            type: "object",
            additionalProperties: false,
            required: ["main_message", "problem", "resolution", "takeaway"],
            properties: {
                main_message: { type: "string" },
                problem: { type: "string" },
                resolution: { type: "string" },
                takeaway: { type: "string" }
            }
        },

        segments: {
            type: "array",
            minItems: 3,
            maxItems: 7,
            items: {
                type: "object",
                additionalProperties: false,
                required: ["order", "narration", "visual_idea", "image_prompt_seed"],
                properties: {
                    order: { type: "number" },
                    narration: { type: "string" },
                    visual_idea: { type: "string" },
                    image_prompt_seed: { type: "string" }
                }
            }
        },

        hashtags: {
            type: "array",
            minItems: 5,
            maxItems: 12,
            items: { type: "string" }
        },

        estimated_total_duration: {
            type: "number",
            minimum: 12,
            maximum: 60
        }
    }
};
