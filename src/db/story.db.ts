import { fireStore } from "../config/firebase/firebase.js";
import { collectionNames } from "./collection.names.js";

export class StoryDB {
    private static instance: StoryDB;

    private constructor() { }

    public static getInstance(): StoryDB {
        if (!StoryDB.instance) {
            StoryDB.instance = new StoryDB();
        }
        return StoryDB.instance;
    }

    public async createStory(userId: string, projectId: string, storyData: any) {
        const storyRef = fireStore.collection(collectionNames.userCollectionName).doc(userId)
            .collection(collectionNames.projectCollectionName).doc(projectId)
            .collection(collectionNames.storyCollectionName).doc(storyData.id);

        await storyRef.set(storyData);
        const storyDoc = await storyRef.get();
        return { id: storyDoc.id, ...storyDoc.data() };
    }

    public async getAllStoriesByProjectId(userId: string, projectId: string) {
        const storiesRef = fireStore.collection(collectionNames.userCollectionName).doc(userId)
            .collection(collectionNames.projectCollectionName).doc(projectId)
            .collection(collectionNames.storyCollectionName);

        const snapshot = await storiesRef.get();
        const stories: any[] = [];
        snapshot.forEach(story => {
            stories.push(story.data())
        })
        return stories;
    }
}