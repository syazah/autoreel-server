import { z } from "zod";
import { VideoCategoriesSchema } from "./video.js";

export interface YTSearchParams {
    part: string;
    chart: string;
    regionCode: string;
    maxResults: number;
    key: string;
    videoCategoryId?: string;
}

export const TrendsRequestSchema = z.object({
    regionCode: z.string().optional().default("US"),
    maxResults: z.number().optional().default(50),
    categories: z.array(VideoCategoriesSchema).nullable().default(null),
});
export type TrendsRequest = z.infer<typeof TrendsRequestSchema>;

export const VideoMetricsSchema = z.object({
    views: z.number(),
    likes: z.number(),
    comments: z.number(),
    ageInHours: z.number(),
    engagementRate: z.number(),
    likeRatio: z.number(),
    viewsPerHour: z.number(),
    commentRate: z.number(),
});
export type VideoMetrics = z.infer<typeof VideoMetricsSchema>;

export const CategorizedVideoSchema = z.object({
    id: z.string(),
    title: z.string(),
    channel: z.string(),
    categoryId: z.string(),
    publishedAt: z.string(),
    thumbnail: z.string(),
    url: z.string(),
    tags: z.array(z.string()),
    duration: z.number(),
    metrics: VideoMetricsSchema,
});
export type CategorizedVideo = z.infer<typeof CategorizedVideoSchema>;

export const HourBucketSchema = z.object({
    count: z.number(),
    avgEngagement: z.number(),
});
export type HourBucket = z.infer<typeof HourBucketSchema>;

export const PostingHoursSchema = z.object({
    hour: z.number(),
    avgEngagement: z.number(),
    videoCount: z.number(),
});
export type PostingHours = z.infer<typeof PostingHoursSchema>;

export const TrendingTopicSchema = z.object({
    topic: z.string(),
    count: z.number(),
    avgEngagement: z.number(),
});

export const TrendsDataSchema = z.object({
    viralPotential: z.array(CategorizedVideoSchema),
    risingStars: z.array(CategorizedVideoSchema),
    nicheOpportunities: z.record(z.string(), z.array(CategorizedVideoSchema)),
    engagementByHour: z.array(PostingHoursSchema),
    trendingTopics: z.array(TrendingTopicSchema),
    metadata: z.object({
        totalVideos: z.number(),
        avgEngagementRate: z.number(),
        regionCode: z.string(),
        fetchedAt: z.string(),
    }),
});
export type TrendsData = z.infer<typeof TrendsDataSchema>;
