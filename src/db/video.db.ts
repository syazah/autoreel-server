import { fireStore } from "../config/firebase/firebase.js";
import { collectionNames } from "./collection.names.js";
import { PlanDB } from "./plan.db.js";

const planDB = PlanDB.getInstance()
export class VideoDB {
    private static instance: VideoDB
    private constructor() { }

    public static getInstance(): VideoDB {
        if (!VideoDB.instance) {
            VideoDB.instance = new VideoDB();
        }
        return VideoDB.instance;
    }

    public async updatePlanScript(userId: string, date: string, script: string) {
        const plan = await planDB.getPlanForUserOnDate(userId, date)
        return await fireStore.collection(collectionNames.userCollectionName)
            .doc(userId)
            .collection(collectionNames.planCollectionName)
            .doc(date)
            .collection(collectionNames.videoCollectionName)
            .doc(plan.version?.toString() || "0")
            .set({ script });
    }

    public async getVideoDataForCurrentVersion(userId: string, date: string, version?: string): Promise<{ script: string | null } | null> {
        const plan = await planDB.getPlanForUserOnDate(userId, date)
        const videoDoc = await fireStore.collection(collectionNames.userCollectionName)
            .doc(userId)
            .collection(collectionNames.planCollectionName)
            .doc(date)
            .collection(collectionNames.videoCollectionName)
            .doc((version || "0"))
            .get()
        if (!videoDoc.exists) {
            return null
        }
        return videoDoc.data() as { script: string | null }
    }
}