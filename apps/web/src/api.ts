import type { Application, ApplicationDraft } from "./types"

const baseUrl = (import.meta as any).env && (import.meta as any).env.VITE_API_URL ? (import.meta as any).env.VITE_API_URL : "/api"

async function readJson(res: Response) {
  const text = await res.text()
  if (!text.length) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function listApplications(): Promise<Application[]> {
  const res = await fetch(`${baseUrl}/applications`)
  if (!res.ok) throw new Error("list_failed")
  const data = await res.json()
  return data as Application[]
}

export async function createApplication(draft: ApplicationDraft): Promise<Application> {
  const payload: any = {
    company: draft.company,
    role: draft.role,
    stage: draft.stage
  }

  if (draft.jobUrl.trim().length) payload.jobUrl = draft.jobUrl.trim()
  if (draft.notes.trim().length) payload.notes = draft.notes.trim()
  if (draft.nextActionAt.trim().length) payload.nextActionAt = new Date(draft.nextActionAt).toISOString()

  const res = await fetch(`${baseUrl}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const e = await readJson(res)
    throw new Error(e && e.error ? String(e.error) : "create_failed")
  }

  const data = await res.json()
  return data as Application
}

export async function patchApplication(id: string, patch: Partial<Application>): Promise<Application> {
  const payload: any = {}

  if (patch.company !== undefined) payload.company = patch.company
  if (patch.role !== undefined) payload.role = patch.role
  if (patch.stage !== undefined) payload.stage = patch.stage
  if (patch.jobUrl !== undefined) payload.jobUrl = patch.jobUrl
  if (patch.notes !== undefined) payload.notes = patch.notes
  if (patch.nextActionAt !== undefined) payload.nextActionAt = patch.nextActionAt

  const res = await fetch(`${baseUrl}/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const e = await readJson(res)
    throw new Error(e && e.error ? String(e.error) : "patch_failed")
  }

  const data = await res.json()
  return data as Application
}

export async function deleteApplication(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/applications/${id}`, { method: "DELETE" })
  if (res.status === 204) return
  const e = await readJson(res)
  throw new Error(e && e.error ? String(e.error) : "delete_failed")
}
