import { fireStore } from "../config/firebase/firebase.js";
import type { Project } from "../types/project.js";

export class ProjectDB {
    private static instance: ProjectDB;
    private userCollectionName = "user";
    private projectCollectionName = "projects";
    private constructor() { };

    public static getInstance(): ProjectDB {
        if (!ProjectDB.instance) {
            ProjectDB.instance = new ProjectDB();
        }
        return ProjectDB.instance;
    }

    public async createProject(userId: string, projectData: Project) {
        const project = await fireStore.collection(this.userCollectionName).doc(userId).collection(this.projectCollectionName).add(projectData);
        return project;
    }

    public async getAllProjectsForUser(userId: string) {
        const projectsSnapshot = await fireStore.collection(this.userCollectionName).doc(userId).collection(this.projectCollectionName).get();
        const projects: Project[] = [];
        projectsSnapshot.forEach((doc) => {
            projects.push({ ...(doc.data() as Project) });
        });
        return projects;
    }
}