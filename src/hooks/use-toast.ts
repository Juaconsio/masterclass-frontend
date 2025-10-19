import { useCallback, useState } from 'react'

type Toast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((toast: Toast) => {
    setToasts((t) => [...t, { ...toast, id: toast.id || String(Date.now()) }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  return {
    toasts,
    add,
    remove,
  }
}

export type { Toast }
