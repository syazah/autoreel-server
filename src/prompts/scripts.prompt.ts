import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";
import type { PlanResponse, PlanTopic } from "../types/plan.js";

const SYSTEM_PROMPT = `You are an expert short-form video content creator and a professional script writer. Your job is to create a script for a short-form video based on the provided content topic and key points.

Rules:
- The script should be concise, engaging, and optimized for a 60-second video format.
- Start with a hook to grab attention, followed by a clear introduction of the topic.
- Use the key points to structure the main content, ensuring a logical flow.
- End with a strong call-to-action or a memorable closing statement.
- Output ONLY valid JSON matching the required schema. No extra text.


You will be provided with a content topic and a short summary of the topic used for creating the video. Use it to craft a compelling script that can be easily followed by a video creator or can be used to generate a full LLM generated video.

Do not include any explanations or additional text outside what is required in the script. Focus on making the script as engaging and clear as possible, while adhering to the structure outlined above.`;

export const buildScriptPrompt = (
    content: PlanTopic
): ChatCompletionMessageParam[] => {

    const userMessage = `Create a weekly content plan with the following details:

- Topic Of Video: ${content.title}
- Summary Of The Video: ${content.shortSummary}

Generate an extensive script for this video topic.`;

    return [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
    ];
};
