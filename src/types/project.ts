export interface Project {
    name: String
    frequency: number
    category: Category
}

export interface ProjectWithId extends Project {
    id: string
}

enum Category {
    Children = "Children",
    Informative = "Informative",
    Fiction = "Fiction"
}