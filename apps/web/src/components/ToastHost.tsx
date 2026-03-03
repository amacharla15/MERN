import { useEffect } from "react"

export type ToastKind = "success" | "error" | "info"

export type Toast = {
  id: string
  kind: ToastKind
  message: string
}

export function ToastHost(props: { toasts: Toast[]; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (props.toasts.length === 0) return
    const timers: number[] = []
    for (const t of props.toasts) {
      const timer = window.setTimeout(() => props.onRemove(t.id), 2800)
      timers.push(timer)
    }
    return () => {
      for (const tm of timers) window.clearTimeout(tm)
    }
  }, [props.toasts])

  return (
    <div className="toast toast-end toast-bottom z-50">
      {props.toasts.map((t) => {
        const cls =
          t.kind === "success"
            ? "alert alert-success"
            : t.kind === "error"
            ? "alert alert-error"
            : "alert alert-info"
        return (
          <div key={t.id} className={cls}>
            <span className="text-sm">{t.message}</span>
            <button className="btn btn-ghost btn-xs" onClick={() => props.onRemove(t.id)}>
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
