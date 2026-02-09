import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";
import type { StructuredCompletionOptions } from "../../types/story.js";

export class GroqClient {
    private static instance: GroqClient;
    private apiKey: string = process.env.GROQ_API_KEY!!;
    private groq = new Groq({ apiKey: this.apiKey });
    private model = "openai/gpt-oss-20b"
    private constructor() { }

    public static getInstance(): GroqClient {
        if (!GroqClient.instance) {
            GroqClient.instance = new GroqClient();
        }
        return GroqClient.instance;
    }

    public async getStructuredCompletion<T>({
        messages,
        schema,
        schemaName,
    }: StructuredCompletionOptions<T>): Promise<T> {

        const completion = await this.groq.chat.completions.create({
            model: this.model,
            messages,
            temperature: 0.3,

            response_format: {
                type: "json_schema",
                json_schema: {
                    name: schemaName,
                    strict: true,
                    schema: schema,
                },
            },
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error("LLM returned empty response");
        }

        try {
            return JSON.parse(content) as T;
        } catch (err) {
            throw new Error("Failed to parse structured LLM response: " + content);
        }
    }

}