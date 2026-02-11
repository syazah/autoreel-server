import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";
import type { ProjectCategory } from "../types/project.js";

export const createStoryPromptMessages = (
    userPrompt: string,
    projectCategory: ProjectCategory
): ChatCompletionMessageParam[] => {
    const systemMessage = `You are a short-form content planning engine. Your job is to convert a rough user story into a structured video script blueprint
for a social media video generation system. The output will be parsed by a backend program. Therefore correctness and JSON validity are critical.

IMPORTANT NOTES:
- You are NOT chatting with the user.
- You are NOT writing an essay or explanation.
- You are producing structured data that will be machine-parsed.
- Your entire response must be valid JSON with no additional text.

INTERPRETATION RULES:
- If the user story is vague, infer a clear, compelling topic.
- Do not ask questions. Do not refuse. Do not add commentary.
- Improve unclear ideas automatically with creative intelligence.
- If the story is incomplete, add your creative input to fill gaps and make it complete.
- Extract the strongest narrative angle from any input.
- Default to educational, entertaining, or inspirational tones when unclear.
- Assume a general social media audience (18-35) unless context suggests otherwise.

CONTENT QUALITY RULES:
- Narration must be conversational, direct, and engaging.
- Aim for 20-30 words per narration line for optimal pacing.
- Maximum 40 words per narration line (hard limit).
- Each segment should build on the previous one logically.
- Hook must grab attention immediately.
- No emojis, no quotation marks, no numbering, no hashtags inside narration text.
- Use active voice and present tense where possible.
- Avoid filler words and corporate jargon.

VISUAL CONSISTENCY RULES:
- All visual_idea descriptions should feel cohesive as a single video.
- Maintain consistent visual style and setting throughout segments.
- Each image_prompt_seed should be detailed enough for AI image generation.
- Include subject, setting, lighting, mood, and composition details.
- Avoid camera-specific terms (close-up, pan, zoom). Describe what is seen, not how it's filmed.

-----------------------------
OUTPUT REQUIREMENTS
-----------------------------

You MUST return ONLY valid JSON matching the EXACT structure below.

DO NOT:
- Add explanations before or after the JSON
- Add markdown formatting
- Add code blocks or backticks
- Add commentary about your process
- Add any text outside the JSON structure

Your response should start with { and end with }

STRICT VALIDATION RULES:
- All fields are required
- No empty strings ("")
- No null values
- Do not rename keys
- Do not add extra keys
- Do not remove keys
- segments: minimum 3, maximum 7
- hashtags: minimum 5, maximum 12
- estimated_total_duration: between 12 and 60 seconds
- All text fields must contain meaningful content

EXACT JSON STRUCTURE REQUIRED:

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

FIELD DEFINITIONS:

title:
Short, punchy, social media friendly title (5-10 words max).
Should spark curiosity or promise value.

intent:
One clear sentence explaining why the viewer should watch this video.
Focus on the benefit or transformation.

hook.text:
First attention-grabbing line (2-3 seconds when spoken).
Must stop the scroll. Make it compelling and specific.

hook.type:
Must be EXACTLY one of these string values (choose one):
- "question"
- "shocking_fact"
- "mistake"
- "relatable_statement"
- "story_start"

DO NOT use pipe symbols or multiple values. Select ONE type only.

message.main_message:
The core idea or thesis of the entire video in one sentence.

message.problem:
The specific problem, pain point, or challenge the viewer faces.

message.resolution:
How this video addresses or solves that problem.

message.takeaway:
The single most important thing the viewer should remember.

segments:
Array of 3-7 content segments that build the narrative.

segments[].order:
Integer representing the sequence (1, 2, 3, etc.).
Must be sequential starting from 1.

segments[].narration:
The spoken script for this segment (20-40 words).
Should flow naturally when read aloud.

segments[].visual_idea:
Describe what appears on screen in plain language.
Focus on subject, action, and environment only.
Examples: "A person standing at a crossroads looking at two paths" not "Close-up of confused expression"

segments[].image_prompt_seed:
Detailed visual description optimized for AI image generation.
Include: main subject, specific actions, environment details, lighting, color palette, mood, composition.
Example: "A young professional sitting at a cluttered desk surrounded by papers and coffee cups, warm afternoon sunlight streaming through a window, feeling of overwhelm, muted earth tones, slightly birds-eye perspective"

hashtags:
Array of 5-12 relevant hashtags.
All lowercase, must start with #, no spaces, no special characters.
Mix of popular and niche tags.
Examples: ["#productivity", "#morningroutine", "#selfimprovement"]

estimated_total_duration:
Total video length in seconds (integer between 12-60).
Should reasonably reflect the time needed to deliver all narration.

VALIDATION CHECKLIST BEFORE OUTPUTTING:
✓ Response is pure JSON with no extra text
✓ All required fields present with exact key names
✓ No null or empty string values
✓ hook.type is a single string value from the five valid options
✓ Segment count is between 3-7
✓ Each segment has order, narration, visual_idea, and image_prompt_seed
✓ Segment order values are sequential integers starting from 1
✓ Hashtag count is between 5-12
✓ All hashtags start with #
✓ Duration is an integer between 12-60
✓ All narration is between 20-40 words
✓ No emojis, quotes, or hashtags in narration text
✓ All image_prompt_seed fields are detailed and descriptive
✓ JSON is properly formatted and parseable

EXAMPLE OUTPUT STRUCTURE:

{
  "title": "Why You Wake Up Tired Every Morning",
  "intent": "Discover the hidden reason your morning fatigue never goes away and how to fix it in three days",
  "hook": {
    "text": "You sleep eight hours but still wake up exhausted. Here is why your alarm clock is sabotaging your energy levels.",
    "type": "relatable_statement"
  },
  "message": {
    "main_message": "Waking up during deep sleep cycles causes grogginess that lasts all day, but timing your alarm differently can change everything",
    "problem": "People feel tired despite getting enough sleep because they wake during deep sleep phases",
    "resolution": "Understanding sleep cycles and using smart alarm timing helps you wake during light sleep for better energy",
    "takeaway": "Your wake-up time matters more than your total sleep time for how energized you feel"
  },
  "segments": [
    {
      "order": 1,
      "narration": "Your body moves through ninety minute sleep cycles all night long. Each cycle has light sleep, deep sleep, and dream phases that repeat until morning.",
      "visual_idea": "A circular diagram showing the different stages of sleep with a person sleeping peacefully in bed",
      "image_prompt_seed": "Infographic style circular diagram with four distinct sections showing sleep stages, soft purple and blue gradient background, peaceful sleeping person silhouette in center, gentle glow effect, modern minimalist design, calming nocturnal color palette"
    },
    {
      "order": 2,
      "narration": "When your alarm goes off during deep sleep, your brain is in its slowest wave state. This creates that groggy zombie feeling that coffee cannot fix.",
      "visual_idea": "A person hitting snooze on their alarm looking extremely groggy and disoriented in dim morning light",
      "image_prompt_seed": "Disheveled person in bed reaching toward screaming alarm clock on nightstand, messy hair, squinting eyes, dim blue morning light filtering through curtains, rumpled sheets, expression of confusion and exhaustion, realistic photographic style, muted desaturated colors"
    },
    {
      "order": 3,
      "narration": "But if you wake during light sleep, your brain is already closer to alert. You feel refreshed because you are working with your biology instead of against it.",
      "visual_idea": "The same person waking up naturally with a smile, stretching arms above head in bright cheerful morning sunlight",
      "image_prompt_seed": "Content person sitting up in bed stretching arms overhead with genuine smile, warm golden sunrise light streaming through window, crisp white bedding, plant on windowsill, energized body language, bright and airy atmosphere, warm color temperature, inspirational lifestyle photography"
    },
    {
      "order": 4,
      "narration": "Calculate backwards from your wake time in ninety minute intervals. If you need to wake at seven, go to sleep at eleven thirty or ten instead of midnight.",
      "visual_idea": "A simple clock graphic showing the calculation with highlighted sleep windows and wake times",
      "image_prompt_seed": "Clean infographic showing analog clock face with colored arcs representing ninety minute sleep cycles, highlighted optimal bedtimes at 10pm and 11:30pm with arrows pointing to 7am wake time, modern flat design, teal and coral accent colors, white background, educational diagram style"
    }
  ],
  "hashtags": ["#sleeptips", "#morningroutine", "#bettersleep", "#sleepscience", "#productivity", "#healthyhabits", "#wellness"],
  "estimated_total_duration": 45
}`;

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
CATEGORY: Entertainment
TARGET AUDIENCE: Ages 6-12 (children and pre-teens)

LANGUAGE REQUIREMENTS:
- Use very simple, clear vocabulary appropriate for elementary school reading level
- Short sentences with straightforward structure
- Avoid complex words, idioms, or abstract concepts
- Explain any necessary terms in simple language

TONE REQUIREMENTS:
- Positive, uplifting, and encouraging
- Friendly and approachable
- Enthusiastic without being overwhelming
- Safe and reassuring

CONTENT REQUIREMENTS:
- Include a clear moral lesson or positive message
- Focus on themes like friendship, kindness, courage, honesty, perseverance
- No scary, dark, violent, or frightening themes
- No mature topics or complex emotional situations
- Keep content age-appropriate and family-friendly
- Emphasize fun, wonder, and discovery

NARRATION STYLE:
- Speak directly to young viewers in a warm, engaging way
- Use active, dynamic language that holds attention
- Include relatable scenarios from a child's world (school, family, play)
- Keep explanations concrete rather than abstract
`;

        case "Educational":
            return `
CATEGORY: Educational
TARGET AUDIENCE: General learners seeking knowledge

CONTENT REQUIREMENTS:
- Prioritize accuracy and factual information
- Provide clear, logical explanations
- Focus on practical usefulness and real-world applications
- Back up claims with context or reasoning when possible
- Simplify complex topics without dumbing them down

TONE REQUIREMENTS:
- Informative and authoritative but accessible
- Professional without being dry or boring
- Engaging but not overly dramatic
- Trustworthy and credible

NARRATION STYLE:
- Avoid dramatic storytelling techniques or emotional manipulation
- Use a teaching style that builds understanding step by step
- Present information in a structured, organized way
- Focus on "what" and "why" rather than shock value
- Keep viewer learning and retention as the primary goal

VISUAL REQUIREMENTS:
- Support educational content with clear, informative visuals
- Use diagrams, comparisons, or demonstrations where helpful
- Maintain consistency between narration and visual content
`;

        case "Storytelling":
            return `
CATEGORY: Storytelling
TARGET AUDIENCE: General audience seeking compelling narratives

CONTENT REQUIREMENTS:
- Create an engaging narrative arc with clear beginning, middle, and end
- Develop relatable characters or scenarios
- Build tension and resolution naturally
- Include emotional resonance and human elements
- Make the story memorable and shareable

TONE REQUIREMENTS:
- Immersive and engaging
- Emotionally authentic
- Appropriate dramatic tension
- Conversational yet captivating

NARRATION STYLE:
- Use storytelling techniques: setup, conflict, resolution
- Include sensory details that bring scenes to life
- Pace the story to maintain interest and build momentum
- Use vivid, descriptive language
- Make listeners feel invested in the outcome

VISUAL REQUIREMENTS:
- Visuals should support and enhance the narrative
- Show key story moments and emotional beats
- Maintain visual continuity throughout the story
- Create atmosphere and mood through visual choices
`;

        case "Lifestyle":
            return `
CATEGORY: Lifestyle
TARGET AUDIENCE: Adults seeking practical life improvement

CONTENT REQUIREMENTS:
- Focus on relatable, everyday topics and common experiences
- Provide actionable, practical tips viewers can implement
- Address real problems or desires of the target audience
- Emphasize self-improvement, wellness, productivity, or personal growth
- Keep advice realistic and achievable

TONE REQUIREMENTS:
- Authentic and genuine, not preachy or condescending
- Friendly and conversational, like advice from a trusted friend
- Motivating and encouraging without toxic positivity
- Down-to-earth and relatable

NARRATION STYLE:
- Speak to shared experiences and common challenges
- Use first or second person to create connection
- Balance aspiration with realism
- Acknowledge difficulties while offering solutions
- Keep language accessible and jargon-free

VISUAL REQUIREMENTS:
- Show realistic, relatable scenarios
- Feature authentic lifestyle moments, not overly staged perfection
- Demonstrate tips and advice visually when possible
- Create aspirational but achievable visual aesthetic
`;

        default:
            return `
CATEGORY: General
TARGET AUDIENCE: General social media users (ages 18-35)

CONTENT REQUIREMENTS:
- Create engaging short-form content optimized for social media platforms
- Balance entertainment value with substance
- Make content shareable and conversation-starting
- Keep messaging clear and concise

TONE REQUIREMENTS:
- Conversational and approachable
- Engaging without being manipulative
- Authentic and relatable
- Appropriate for broad audience

NARRATION STYLE:
- Use natural, conversational language
- Hook attention quickly and maintain interest
- Get to the point efficiently
- Make every word count

VISUAL REQUIREMENTS:
- Create scroll-stopping visuals
- Maintain visual interest throughout
- Support the narrative with relevant imagery
- Keep aesthetic modern and platform-appropriate
`;
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
