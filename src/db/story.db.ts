import { fireStore } from "../config/firebase/firebase.js";

export class StoryDB {
    private static instance: StoryDB;
    private collectionName = "story"
    private userCollectionName = "user"
    private projectCollectionName = "projects"

    private constructor() { }

    public static getInstance(): StoryDB {
        if (!StoryDB.instance) {
            StoryDB.instance = new StoryDB();
        }
        return StoryDB.instance;
    }

    public async createStory(userId: string, projectId: string, storyData: any) {
        const storyRef = fireStore.collection(this.userCollectionName).doc(userId)
            .collection(this.projectCollectionName).doc(projectId)
            .collection(this.collectionName).doc(storyData.id);

        await storyRef.set(storyData);
        const storyDoc = await storyRef.get();
        return { id: storyDoc.id, ...storyDoc.data() };
    }

    public async getAllStoriesByProjectId(userId: string, projectId: string) {
        const storiesRef = fireStore.collection(this.userCollectionName).doc(userId)
            .collection(this.projectCollectionName).doc(projectId)
            .collection(this.collectionName);

        const snapshot = await storiesRef.get();
        const stories: any[] = [];
        snapshot.forEach(story => {
            stories.push(story.data())
        })
        return stories;
    }
}