import { fireStore } from "../config/firebase/firebase.js";
import type { UserData } from "../types/user.js";
import { collectionNames } from "./collection.names.js";

export class UserDB {
    private static instance: UserDB;
    constructor() { }

    public static getInstance(): UserDB {
        if (!UserDB.instance) {
            UserDB.instance = new UserDB();
        }
        return UserDB.instance;
    }

    public async getUserOrNull(uid: string): Promise<UserData | null> {
        const user = await fireStore.collection(collectionNames.userCollectionName).doc(uid).get();
        return user.exists ? { ...user.data() } as UserData : null;
    }

    public async createUser(userData: UserData) {
        const user = await fireStore.collection(collectionNames.userCollectionName).doc(userData.uid).set(userData);
        return userData;
    }

    public async updateUser(uid: string, data: Partial<UserData>) {
        await fireStore.collection(collectionNames.userCollectionName).doc(uid).update(data);
    }
}