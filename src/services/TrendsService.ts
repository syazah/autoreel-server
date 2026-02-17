import axios from "axios";
import type { CategorizedVideo, HourBucket, PostingHours, TrendsData, TrendsRequest, VideoMetrics, YTSearchParams } from "../types/trends.js";
import { VideoCategoriesSchema, type VideoCategory } from "../types/video.js";

export class TrendsService {
    private youtubeApiKey: string = process.env.YOUTUBE_API_KEY!!;
    private youtubeApiUrl: string = "https://www.googleapis.com/youtube/v3"
    private redditApiKey: string = process.env.REDDIT_API_KEY || '';
    private static instance: TrendsService;

    private constructor() { }

    public static getInstance(): TrendsService {
        if (!TrendsService.instance) {
            TrendsService.instance = new TrendsService();
        }
        return TrendsService.instance;
    }

    private async getYTTrends(regionCode: string = 'US', maxResults: number = 10, categoryId: string | null = null) {
        const params: YTSearchParams = {
            part: 'snippet,statistics,contentDetails',
            chart: 'mostPopular',
            regionCode,
            maxResults,
            key: this.youtubeApiKey
        }
        if (categoryId) {
            params.videoCategoryId = categoryId;
        }
        const response = await axios.get(`${this.youtubeApiUrl}/videos`, { params });
        if (response.status !== 200) {
            throw new Error(`YouTube API error: ${response.status} - ${response.statusText}`);
        }
        const data = response.data;
        return data
    }

    private parseVideoDuration(duration: string): number {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;

        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');

        return hours * 3600 + minutes * 60 + seconds;
    }

    private async getCategorizedTrends(trendsRequest: TrendsRequest): Promise<TrendsData> {
        let categories = ""
        trendsRequest.categories?.forEach((cat, index) => {
            categories += this.getCategoryId(cat);
        })
        const response = await this.getYTTrends(
            trendsRequest.regionCode || 'US',
            trendsRequest.maxResults || 50,
            categories === "" ? null : categories
        );
        const videos = response.items.map((video: any) => {
            const metrics = this.calculateEngagementMetrics(video);
            return this.categorizeVideos(video, metrics);
        });
        // Category 1: Viral Potential (Top Engagement)
        const viralPotential = videos
            .filter((v: CategorizedVideo) => v.metrics.engagementRate > 5) // >5% is excellent
            .sort((a: CategorizedVideo, b: CategorizedVideo) => b.metrics.engagementRate - a.metrics.engagementRate)
            .slice(0, 10);

        // Category 2: Rising Stars (New + High Velocity)
        const risingStars = videos
            .filter((v: CategorizedVideo) => v.metrics.ageInHours < 24 && v.metrics.viewsPerHour > 10000)
            .sort((a: CategorizedVideo, b: CategorizedVideo) => b.metrics.viewsPerHour - a.metrics.viewsPerHour)
            .slice(0, 10);

        // Category 3: Niche Opportunities (by category)
        const nicheOpportunities: { [key: string]: CategorizedVideo[] } = {};
        videos.forEach((v: CategorizedVideo) => {
            const categoryName = this.getCategoryName(v.categoryId);
            if (!nicheOpportunities[categoryName]) {
                nicheOpportunities[categoryName] = [];
            }
            nicheOpportunities[categoryName].push(v);
        });
        // Category 5: Best Engagement Windows (when to post)
        const engagementByHour = this.analyzePostingTimes(videos);

        // Category 6: Trending Topics (from tags/titles)
        const trendingTopics = this.extractTrendingTopics(videos);
        return {
            viralPotential,
            risingStars,
            nicheOpportunities,
            engagementByHour,
            trendingTopics,
            metadata: {
                totalVideos: parseInt(videos.length) || 0,
                avgEngagementRate: videos.length ? videos.reduce((sum: number, v: CategorizedVideo) => sum + v.metrics.engagementRate, 0) / videos.length : 0,
                regionCode: trendsRequest.regionCode || "",
                fetchedAt: new Date().toISOString()
            }
        };
    }

    private analyzePostingTimes(videos: CategorizedVideo[]): PostingHours[] {
        const hourBuckets: { [key: number]: HourBucket } = {};

        videos.forEach(v => {
            const publishHour = new Date(v.publishedAt).getHours();
            if (!hourBuckets[publishHour]) {
                hourBuckets[publishHour] = { count: 0, avgEngagement: 0 };
            }
            hourBuckets[publishHour].count++;
            hourBuckets[publishHour].avgEngagement += v.metrics.engagementRate;
        });

        Object.keys(hourBuckets).forEach(hour => {
            const bucket = hourBuckets[parseInt(hour)] || { count: 0, avgEngagement: 0 };
            bucket.avgEngagement = bucket.avgEngagement / bucket.count;
        });

        const bestHours = Object.entries(hourBuckets)
            .sort(([, a], [, b]) => b.avgEngagement - a.avgEngagement)
            .slice(0, 5)
            .map(([hour, data]) => ({
                hour: parseInt(hour),
                avgEngagement: data.avgEngagement,
                videoCount: data.count
            }));

        return bestHours;
    }

    private extractTrendingTopics(videos: CategorizedVideo[]): Array<{ topic: string, count: number, avgEngagement: number }> {
        const topicMap = new Map<string, { count: number, totalEngagement: number }>();

        videos.forEach(v => {
            // Extract from tags
            v.tags.forEach(tag => {
                const normalizedTag = tag.toLowerCase().trim();
                if (normalizedTag.length > 3) { // Filter out very short tags
                    const existing = topicMap.get(normalizedTag) || { count: 0, totalEngagement: 0 };
                    topicMap.set(normalizedTag, {
                        count: existing.count + 1,
                        totalEngagement: existing.totalEngagement + v.metrics.engagementRate
                    });
                }
            });
        });

        return Array.from(topicMap.entries())
            .filter(([, data]) => data.count >= 2)
            .map(([topic, data]) => ({
                topic,
                count: data.count,
                avgEngagement: data.totalEngagement / data.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);
    }

    private calculateEngagementMetrics(video: any): VideoMetrics {
        const views = parseInt(video.statistics.viewCount || 0);
        const likes = parseInt(video.statistics.likeCount || 0);
        const comments = parseInt(video.statistics.commentCount || 0);
        const publishedAt = new Date(video.snippet.publishedAt);
        const now = new Date();
        const ageInHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

        return {
            views,
            likes,
            comments,
            ageInHours,
            engagementRate: views > 0 ? ((likes + comments) / views) * 100 : 0,
            likeRatio: views > 0 ? (likes / views) * 100 : 0,
            viewsPerHour: ageInHours > 0 ? views / ageInHours : 0,
            commentRate: views > 0 ? (comments / views) * 100 : 0
        };
    }

    private categorizeVideos(video: any, metrics: VideoMetrics): CategorizedVideo {
        const durationInSeconds = this.parseVideoDuration(video.contentDetails.duration);
        return {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            channel: video.snippet.channelTitle,
            categoryId: video.snippet.categoryId,
            publishedAt: video.snippet.publishedAt,
            thumbnail: video.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            tags: video.snippet.tags || [],
            duration: durationInSeconds,
            metrics: {
                views: metrics.views,
                likes: metrics.likes,
                comments: metrics.comments,
                ageInHours: metrics.ageInHours,
                engagementRate: metrics.engagementRate,
                likeRatio: metrics.likeRatio,
                viewsPerHour: metrics.viewsPerHour,
                commentRate: metrics.commentRate
            }
        }
    }

    private getCategoryName(categoryId: string): string {
        const categories: { [key: string]: string } = {
            '10': VideoCategoriesSchema.enum.Music,
            '20': VideoCategoriesSchema.enum.Gaming,
            '24': VideoCategoriesSchema.enum.Entertainment,
            '25': VideoCategoriesSchema.enum.News,
            '28': VideoCategoriesSchema.enum.Science,
            '17': VideoCategoriesSchema.enum.Sports,
            '27': VideoCategoriesSchema.enum.Education,
            '23': VideoCategoriesSchema.enum.Comedy,
            '22': VideoCategoriesSchema.enum.People
        };
        return categories[categoryId] || 'Other';
    }

    private getCategoryId(categoryName: VideoCategory): string | null {
        const categories: { [key: string]: string } = {
            [VideoCategoriesSchema.enum.Music]: '10',
            [VideoCategoriesSchema.enum.Gaming]: '20',
            [VideoCategoriesSchema.enum.Entertainment]: '24',
            [VideoCategoriesSchema.enum.News]: '25',
            [VideoCategoriesSchema.enum.Science]: '28',
            [VideoCategoriesSchema.enum.Sports]: '17',
            [VideoCategoriesSchema.enum.Education]: '27',
            [VideoCategoriesSchema.enum.Comedy]: '23',
            [VideoCategoriesSchema.enum.People]: '22'
        };
        return categories[categoryName] || null;
    }

    public async getTrends(trendsRequest: TrendsRequest) {
        try {
            return this.getCategorizedTrends(trendsRequest);
        } catch (error) {
            throw new Error("Failed to fetch trends");
        }
    }

    public async getCategoryTrendVideos(requestedCategories: VideoCategory[]) {
        let categories = ""
        requestedCategories.forEach((cat, index) => {
            categories += this.getCategoryId(cat) + ",";
        })
        let allVideos: CategorizedVideo[] = [];
        for (const cat of requestedCategories) {
            const categoryId = this.getCategoryId(cat);
            if (categoryId) {
                let YTTrends;
                try {
                    YTTrends = await this.getYTTrends("US", 10, categoryId);
                } catch (error) {
                    console.error(`Error fetching trends for category ${cat}:`, error);
                    continue; // Skip this category and move to the next one
                }
                const videos = YTTrends.items.map((video: any) => {
                    const metrics = this.calculateEngagementMetrics(video);
                    return this.categorizeVideos(video, metrics);
                });
                allVideos.push(...videos);
            }
        }

        const videos: CategorizedVideo[] = allVideos
            .filter((v: CategorizedVideo) => v.metrics.engagementRate > 5) // >5% is excellent
            .sort((a: CategorizedVideo, b: CategorizedVideo) => b.metrics.engagementRate - a.metrics.engagementRate)
            .slice(0, 7);

        const result = videos.map((video: CategorizedVideo) => {
            return {
                title: video.title,
                description: video.description,
            }
        })
        return result
    }
}