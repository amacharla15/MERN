import type { Application } from "./types"

const nowIso = () => new Date().toISOString()

export const initialApplications: Application[] = [
  {
    id: "a1",
    company: "Amazon",
    role: "SWE Intern",
    stage: "OA",
    jobUrl: "https://www.amazon.jobs/",
    notes: "OA link in email, finish by Friday",
    nextActionAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdAt: nowIso(),
    updatedAt: nowIso()
  },
  {
    id: "a2",
    company: "Google",
    role: "Software Engineering Intern",
    stage: "APPLIED",
    jobUrl: "https://careers.google.com/",
    notes: "Referral submitted",
    nextActionAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    createdAt: nowIso(),
    updatedAt: nowIso()
  },
  {
    id: "a3",
    company: "Meta",
    role: "Backend Intern",
    stage: "INTERVIEW",
    jobUrl: "https://www.metacareers.com/",
    notes: "Prep: graphs + system design basics",
    nextActionAt: new Date(Date.now() + 1 * 86400000).toISOString(),
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
]
