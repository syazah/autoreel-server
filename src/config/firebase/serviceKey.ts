import dotenv from 'dotenv';
import type { ServiceAccount } from 'firebase-admin';
dotenv.config()

const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY!!.replace(/\\n/g, "\n");
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;


export const serviceKey: ServiceAccount = {
    projectId: projectId || "",
    privateKey: privateKey || "",
    clientEmail: clientEmail || "",
}