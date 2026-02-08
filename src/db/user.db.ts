import { fireStore } from "../config/firebase/firebase.js";
import type { UserData } from "../types/user.js";

export class UserDB {
    private static instance: UserDB;
    private collectionName = "user";
    constructor() { }

    public static getInstance(): UserDB {
        if (!UserDB.instance) {
            UserDB.instance = new UserDB();
        }
        return UserDB.instance;
    }

    public async getUserOrNull(uid: string) {
        const user = await fireStore.collection(this.collectionName).doc(uid).get();
        return user.exists ? { ...user.data() } : null;
    }

    public async createUser(userData: UserData) {
        const user = await fireStore.collection(this.collectionName).doc(userData.uid).set(userData);
        return user;
    }
}