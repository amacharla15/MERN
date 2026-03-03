import { useMemo, useState } from "react"
import { stageLabel, stageOrder } from "../types"
import type { ApplicationDraft, Stage } from "../types"

const emptyDraft = (): ApplicationDraft => ({
  company: "",
  role: "",
  stage: "APPLIED",
  jobUrl: "",
  notes: "",
  nextActionAt: ""
})

export function CreateModal(props: {
  open: boolean
  onClose: () => void
  onCreate: (draft: ApplicationDraft) => Promise<void>
}) {
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft())
  const [error, setError] = useState<string>("")
  const [saving, setSaving] = useState<boolean>(false)

  const stageOptions = useMemo(() => stageOrder, [])

  const close = () => {
    if (saving) return
    setError("")
    setDraft(emptyDraft())
    props.onClose()
  }

  const submit = async () => {
    const company = draft.company.trim()
    const role = draft.role.trim()
    if (company.length === 0) {
      setError("Company is required")
      return
    }
    if (role.length === 0) {
      setError("Role is required")
      return
    }

    setError("")
    setSaving(true)
    try {
      await props.onCreate({ ...draft, company, role })
      setDraft(emptyDraft())
      props.onClose()
    } catch {
      setError("Failed to create. Try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!props.open) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">New Application</h3>
          <button className="btn btn-ghost btn-sm" onClick={close}>
            ✕
          </button>
        </div>

        {error.length > 0 ? (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Company</span>
              </div>
              <input
                className="input input-bordered"
                value={draft.company}
                onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                placeholder="Amazon"
                disabled={saving}
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Role</span>
              </div>
              <input
                className="input input-bordered"
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                placeholder="SWE Intern"
                disabled={saving}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Stage</span>
              </div>
              <select
                className="select select-bordered"
                value={draft.stage}
                onChange={(e) => setDraft({ ...draft, stage: e.target.value as Stage })}
                disabled={saving}
              >
                {stageOptions.map((s) => (
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
              <input
                type="date"
                className="input input-bordered"
                value={draft.nextActionAt}
                onChange={(e) => setDraft({ ...draft, nextActionAt: e.target.value })}
                disabled={saving}
              />
            </label>
          </div>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Job URL</span>
            </div>
            <input
              className="input input-bordered"
              value={draft.jobUrl}
              onChange={(e) => setDraft({ ...draft, jobUrl: e.target.value })}
              placeholder="https://..."
              disabled={saving}
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Notes</span>
            </div>
            <textarea
              className="textarea textarea-bordered min-h-[120px]"
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="OA details, recruiter name, prep notes..."
              disabled={saving}
            />
          </label>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={close} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={close}></div>
    </div>
  )
}
