import { fireStore } from "../config/firebase/firebase.js";
import type { Project, ProjectWithId } from "../types/project.js";
import { collectionNames } from "./collection.names.js";

export class ProjectDB {
    private static instance: ProjectDB;
    private constructor() { };

    public static getInstance(): ProjectDB {
        if (!ProjectDB.instance) {
            ProjectDB.instance = new ProjectDB();
        }
        return ProjectDB.instance;
    }

    public async createProject(userId: string, projectData: ProjectWithId) {
        const project = await fireStore
            .collection(collectionNames.userCollectionName)
            .doc(userId)
            .collection(collectionNames.projectCollectionName)
            .doc(projectData.id)
            .set(projectData);
        return project;
    }

    public async getAllProjectsForUser(userId: string) {
        const projectsSnapshot = await fireStore
            .collection(collectionNames.userCollectionName)
            .doc(userId)
            .collection(collectionNames.projectCollectionName)
            .get();
        const projects: Project[] = [];
        projectsSnapshot.forEach((doc) => {
            projects.push({ ...(doc.data() as Project) });
        });
        return projects;
    }
}