import { useEffect, useMemo, useState } from "react"
import { stageLabel, stageOrder } from "./types"
import type { Application, ApplicationDraft, Stage } from "./types"
import { CreateModal } from "./components/CreateModal"
import { DetailDrawer } from "./components/DetailDrawer"
import { ToastHost } from "./components/ToastHost"
import type { Toast } from "./components/ToastHost"
import { createApplication, deleteApplication, listApplications, patchApplication } from "./api"

type StageFilter = Stage | "ALL"
type ViewMode = "BOARD" | "LIST"

const id = () => Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)

function badgeClass(stage: Stage) {
  if (stage === "OFFER") return "badge badge-success"
  if (stage === "INTERVIEW") return "badge badge-primary"
  if (stage === "OA") return "badge badge-warning"
  if (stage === "REJECTED") return "badge badge-error"
  return "badge badge-ghost"
}

function SkeletonCard() {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-4">
        <div className="skeleton h-4 w-2/3"></div>
        <div className="skeleton h-3 w-4/5 mt-2"></div>
        <div className="flex items-center gap-2 mt-3">
          <div className="skeleton h-5 w-14"></div>
          <div className="skeleton h-5 w-20"></div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const v = window.localStorage.getItem("it_theme")
    if (v === "dark" || v === "light") return v
    return "dark"
  })

  const [viewMode, setViewMode] = useState<ViewMode>("BOARD")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState<boolean>(false)

  const [query, setQuery] = useState<string>("")
  const [stageFilter, setStageFilter] = useState<StageFilter>("ALL")

  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    window.localStorage.setItem("it_theme", theme)
  }, [theme])

  const addToast = (kind: Toast["kind"], message: string) => {
    const tid = id()
    setToasts((prev) => [{ id: tid, kind, message }, ...prev].slice(0, 3))
  }

  const removeToast = (tid: string) => setToasts((prev) => prev.filter((t) => t.id !== tid))

  const load = async () => {
    setIsLoading(true)
    try {
      const data = await listApplications()
      setApplications(data)
    } catch {
      addToast("error", "Failed to load from API")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const selected = useMemo(() => {
    if (!selectedId) return null
    return applications.find((a) => a.id === selectedId) || null
  }, [applications, selectedId])

  const createApp = async (draft: ApplicationDraft) => {
    const created = await createApplication(draft)
    setApplications((prev) => [created, ...prev])
    addToast("success", "Application created")
  }

  const saveApp = async (idv: string, patch: Partial<Application>) => {
    const updated = await patchApplication(idv, patch)
    setApplications((prev) => prev.map((a) => (a.id === idv ? updated : a)))
    addToast("success", "Saved")
  }

  const deleteApp = async (idv: string) => {
    await deleteApplication(idv)
    setApplications((prev) => prev.filter((a) => a.id !== idv))
    if (selectedId === idv) setSelectedId(null)
    addToast("info", "Deleted")
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return applications.filter((a) => {
      if (stageFilter !== "ALL" && a.stage !== stageFilter) return false
      if (q.length === 0) return true
      const hay = `${a.company} ${a.role} ${(a.notes || "")}`.toLowerCase()
      return hay.includes(q)
    })
  }, [applications, query, stageFilter])

  const counts = useMemo(() => {
    const m: Record<Stage, number> = { APPLIED: 0, OA: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 }
    for (const a of filtered) m[a.stage] += 1
    return m
  }, [filtered])

  const boardBtn = viewMode === "BOARD" ? "btn btn-ghost justify-start w-full btn-active" : "btn btn-ghost justify-start w-full"
  const listBtn = viewMode === "LIST" ? "btn btn-ghost justify-start w-full btn-active" : "btn btn-ghost justify-start w-full"

  return (
    <div className="min-h-screen bg-base-200">
      <div className="flex">
        <aside className="hidden md:flex w-64 min-h-screen bg-base-100 border-r border-base-300">
          <div className="p-5 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-bold">
                IT
              </div>
              <div>
                <div className="font-semibold">Intern Tracker</div>
                              </div>
            </div>

            <div className="mt-8 space-y-2">
              <button className={boardBtn} onClick={() => setViewMode("BOARD")}>Board view</button>
              <button className={listBtn} onClick={() => setViewMode("LIST")}>List view</button>
              <button className="btn btn-outline btn-sm justify-start w-full" onClick={load}>Sync</button>
            </div>

            <div className="mt-8 p-3 rounded-2xl bg-base-200">
              <div className="text-xs opacity-70">Tip</div>
              <div className="text-sm mt-1">Keep “Next action” dates to avoid forgetting follow-ups.</div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto">
            <div className="sticky top-0 z-30 bg-base-200/80 backdrop-blur border-b border-base-300">
              <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="md:hidden flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-bold">
                      IT
                    </div>
                    <div className="font-semibold">Intern Tracker</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="btn bg-emerald-500 text-black hover:bg-emerald-400 border-emerald-500 hover:border-emerald-400 font-semibold tracking-wide shadow-md hover:shadow-lg transition" onClick={() => setCreateOpen(true)}>
                      New Application
                    </button>
                    <button className="btn btn-ghost text-xl" aria-label="Toggle theme" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
                      {theme === "light" ? "🌙" : "☀️"}
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row gap-3">
                  <label className="input input-bordered flex items-center gap-2 w-full">
                    <span className="opacity-70">🔎</span>
                    <input
                      className="grow"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search company, role, notes..."
                    />
                  </label>

                  <select
                    className="select select-bordered w-full md:w-56"
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value as StageFilter)}
                  >
                    <option value="ALL">All stages</option>
                    {stageOrder.map((s) => (
                      <option key={s} value={s}>
                        {stageLabel[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-4 md:px-6 pb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                {stageOrder.map((s) => (
                  <div key={s} className="bg-base-100 border border-base-300 rounded-2xl p-3">
                    <div className="text-xs opacity-70">{stageLabel[s]}</div>
                    <div className="text-xl font-semibold mt-1">{counts[s]}</div>
                  </div>
                ))}
              </div>
            </div>

            {viewMode === "BOARD" ? (
              <div className="px-4 md:px-6 py-6">
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {stageOrder.map((s) => {
                    const items = filtered.filter((a) => a.stage === s)
                    return (
                      <div key={s} className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px]">
                        <div className="rounded-2xl bg-base-100/60 border border-base-300 p-3">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold">{stageLabel[s]}</div>
                            <span className={badgeClass(s)}>{items.length}</span>
                          </div>

                          <div className="space-y-3">
                            {isLoading ? (
                              <>
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                              </>
                            ) : items.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-5 text-sm opacity-70">
                                Drop a new application here to start tracking.
                              </div>
                            ) : (
                              items.map((a) => (
                                <div
                                  key={a.id}
                                  className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition cursor-pointer"
                                  onClick={() => setSelectedId(a.id)}
                                >
                                  <div className="card-body p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="font-semibold leading-tight">{a.company}</div>
                                        <div className="text-sm opacity-70 mt-1 leading-snug">{a.role}</div>
                                      </div>
                                      <span className={badgeClass(a.stage)}>{stageLabel[a.stage]}</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                      <div className="text-xs opacity-70">
                                        {a.nextActionAt ? "Next: " + new Date(a.nextActionAt).toLocaleDateString() : "No next action"}
                                      </div>
                                      {a.jobUrl ? (
                                        <a
                                          className="btn btn-ghost btn-xs"
                                          href={a.jobUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Link
                                        </a>
                                      ) : (
                                        <div className="text-xs opacity-40"> </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="px-4 md:px-6 py-6">
                <div className="bg-base-100 border border-base-300 rounded-2xl overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Stage</th>
                        <th>Next action</th>
                        <th>Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <>
                          <tr><td colSpan={5}><div className="skeleton h-6 w-full"></div></td></tr>
                          <tr><td colSpan={5}><div className="skeleton h-6 w-full"></div></td></tr>
                          <tr><td colSpan={5}><div className="skeleton h-6 w-full"></div></td></tr>
                        </>
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="opacity-70">
                            No applications match your filters.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((a) => (
                          <tr key={a.id} className="hover cursor-pointer" onClick={() => setSelectedId(a.id)}>
                            <td className="font-semibold">{a.company}</td>
                            <td className="opacity-80">{a.role}</td>
                            <td><span className={badgeClass(a.stage)}>{stageLabel[a.stage]}</span></td>
                            <td className="opacity-80">{a.nextActionAt ? new Date(a.nextActionAt).toLocaleDateString() : "-"}</td>
                            <td>
                              {a.jobUrl ? (
                                <a
                                  className="btn btn-ghost btn-xs"
                                  href={a.jobUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Open
                                </a>
                              ) : (
                                <span className="opacity-50">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createApp} />
      <DetailDrawer
        open={selectedId !== null}
        application={selected}
        onClose={() => setSelectedId(null)}
        onSave={saveApp}
        onDelete={deleteApp}
      />
      <ToastHost toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
