export interface Project {
    name: String
    frequency: number
    category: ProjectCategory
}

export interface ProjectWithId extends Project {
    id: string
}

export enum ProjectCategory {
    CHILDREN = "Children",
    INFORMATIVE = "Informative",
    FICTION = "Fiction"
}