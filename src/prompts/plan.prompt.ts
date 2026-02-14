import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";
import type { VideoCategory } from "../types/video.js";

export type TrendingContent = {
    title: string;
    description: string;
};

const SYSTEM_PROMPT = `You are an expert short-form video content strategist. Your job is to create a personalized weekly video content plan based on the user's preferences and current trending content.

Rules:
- Generate exactly the number of content topics the user requests.
- Each topic must be unique and inspired by (but not copying) the provided trending content.
- Titles should be catchy, curiosity-driven, and optimized for clicks.
- The short summary should outline the core idea and key talking points so it can be used to generate a full video script later.
- Spread topics across the user's preferred categories to keep the content diverse.
- Output ONLY valid JSON matching the required schema. No extra text.`;

export const buildWeekPlanMessages = (
    frequency: number,
    categories: VideoCategory[],
    trendingContent: TrendingContent[]
): ChatCompletionMessageParam[] => {
    const trendingBlock = trendingContent
        .map((t, i) => `${i + 1}. "${t.title}" — ${t.description}`)
        .join("\n");

    const userMessage = `Create a weekly content plan with the following details:

- Number of videos: ${frequency}
- Preferred categories: ${categories.join(", ")}

Here is the currently trending content for inspiration:
${trendingBlock}

Generate ${frequency} unique video topics as a JSON array.`;

    return [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
    ];
};
