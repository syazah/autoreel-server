export interface Project {
    id: string
    name: String
    frequency: number
    category: Category
}

enum Category {
    Children = "Children",
    Informative = "Informative",
    Fiction = "Fiction"
}