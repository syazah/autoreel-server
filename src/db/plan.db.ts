import { fireStore } from "../config/firebase/firebase.js"
import type { PlanResponse, PlanTopic } from "../types/plan.js"
import { collectionNames } from "./collection.names.js"

export class PlanDB {
    private static instance: PlanDB
    private constructor() { }
    public static getInstance(): PlanDB {
        if (!PlanDB.instance) {
            PlanDB.instance = new PlanDB()
        }
        return PlanDB.instance
    }

    private dateKey(base: Date, offset: number): string {
        const d = new Date(base);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + offset);

        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${y}-${m}-${day}`;
    }

    public async updateCompletePlan(userId: string, plan: PlanResponse) {
        const today = new Date();

        const writes = plan.topics.map((topic, index) => {
            return fireStore
                .collection(collectionNames.userCollectionName)
                .doc(userId)
                .collection(collectionNames.planCollectionName)
                .doc(this.dateKey(today, index))
                .set({ ...topic, version: 0 });
        });

        await Promise.all(writes);
        return plan;
    }

    public async getPlanForUserOnDate(userId: string, date: string): Promise<PlanTopic> {
        const planCollectionRef = fireStore
            .collection(collectionNames.userCollectionName)
            .doc(userId)
            .collection(collectionNames.planCollectionName)
            .doc(date);
        return (await planCollectionRef.get()).data() as PlanTopic;
    }
}