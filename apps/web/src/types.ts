export type Stage = "APPLIED" | "OA" | "INTERVIEW" | "OFFER" | "REJECTED"

export const stageOrder: Stage[] = ["APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED"]

export const stageLabel: Record<Stage, string> = {
  APPLIED: "Applied",
  OA: "OA",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected"
}

export type Application = {
  id: string
  company: string
  role: string
  stage: Stage
  jobUrl?: string
  notes?: string
  nextActionAt?: string
  createdAt: string
  updatedAt: string
}

export type ApplicationDraft = {
  company: string
  role: string
  stage: Stage
  jobUrl: string
  notes: string
  nextActionAt: string
}
