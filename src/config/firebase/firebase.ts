import admin from "firebase-admin"
import { serviceKey } from "./serviceKey.js";

admin.initializeApp({
    credential: admin.credential.cert(serviceKey)
})

const fireStore = admin.firestore()

export { admin, fireStore }