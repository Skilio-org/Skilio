export type ClientJob = {
  id: string
  title: string
  description: string
  skills: string
  category: string
  type: string
  budget: string
  status: "Draft" | "Open" | "Closed"
}

export const blankClientJob: ClientJob = {
  id: "",
  title: "",
  description: "",
  skills: "",
  category: "Development",
  type: "Fixed price",
  budget: "",
  status: "Draft",
}
