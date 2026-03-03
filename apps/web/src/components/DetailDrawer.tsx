import { useEffect, useState } from "react"
import { stageLabel, stageOrder } from "../types"
import type { Stage, Application } from "../types"

export function DetailDrawer(props: {
  open: boolean
  application: Application | null
  onClose: () => void
  onSave: (id: string, patch: Partial<Application>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const a = props.application

  const [stage, setStage] = useState<Stage>("APPLIED")
  const [jobUrl, setJobUrl] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [nextActionAt, setNextActionAt] = useState<string>("")
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    if (!a) return
    setStage(a.stage as Stage)
    setJobUrl(a.jobUrl || "")
    setNotes(a.notes || "")
    setNextActionAt(a.nextActionAt ? a.nextActionAt.slice(0, 10) : "")
  }, [a?.id])

  if (!props.open || !a) return null

  const badge =
    stage === "OFFER"
      ? "badge badge-success"
      : stage === "INTERVIEW"
      ? "badge badge-primary"
      : stage === "OA"
      ? "badge badge-warning"
      : stage === "REJECTED"
      ? "badge badge-error"
      : "badge badge-ghost"

  const close = () => {
    if (saving) return
    props.onClose()
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      const patch: Partial<Application> = {
        stage,
        jobUrl: jobUrl.length ? jobUrl : undefined,
        notes: notes.length ? notes : undefined,
        nextActionAt: nextActionAt.length ? new Date(nextActionAt).toISOString() : undefined
      }
      await props.onSave(a.id, patch)
      props.onClose()
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (saving) return
    setSaving(true)
    try {
      await props.onDelete(a.id)
      props.onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={close}></div>

      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-base-100 shadow-2xl border-l border-base-300">
        <div className="p-5 flex items-start justify-between gap-4 border-b border-base-300">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{a.company}</h2>
              <span className={badge}>{stageLabel[stage]}</span>
            </div>
            <div className="text-sm opacity-70 mt-1">{a.role}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={close}>
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-auto h-[calc(100%-132px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Stage</span>
              </div>
              <select className="select select-bordered" value={stage} onChange={(e) => setStage(e.target.value as Stage)} disabled={saving}>
                {stageOrder.map((s) => (
                  <option key={s} value={s}>
                    {stageLabel[s]}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Next action</span>
              </div>
              <input type="date" className="input input-bordered" value={nextActionAt} onChange={(e) => setNextActionAt(e.target.value)} disabled={saving} />
            </label>
          </div>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Job URL</span>
            </div>
            <input className="input input-bordered" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://..." disabled={saving} />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Notes</span>
            </div>
            <textarea className="textarea textarea-bordered min-h-[180px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What happened? What’s next?" disabled={saving} />
          </label>

          <div className="alert">
            <div className="flex flex-col gap-1">
              <div className="text-sm">
                Created: <span className="opacity-70">{new Date(a.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-sm">
                Updated: <span className="opacity-70">{new Date(a.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-base-300 flex items-center justify-between gap-3">
          <button className="btn btn-error btn-outline" onClick={del} disabled={saving}>
            {saving ? "..." : "Delete"}
          </button>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost" onClick={close} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
