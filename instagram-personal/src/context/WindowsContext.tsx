'use client'
// ============================================================
// Windows Context — حالة النوافذ في الموقع
// ============================================================

import { createContext, useContext, useEffect, useState } from 'react'
import type { Window as AppWindow } from '@/types'
import { subscribeWindows, createWindow, updateWindow, deleteWindow } from '@/lib/db'
import { THEMES } from '@/lib/defaults'

type WindowsCtx = {
  windows: AppWindow[]
  activeId: string
  setActiveId: (id: string) => void
  activeWindow: AppWindow | null
  addWindow: (title: string, slug: string, themeKey: string) => Promise<void>
  editWindow: (id: string, data: Partial<AppWindow>) => Promise<void>
  removeWindow: (id: string) => Promise<void>
  loading: boolean
}

const WindowsContext = createContext<WindowsCtx | null>(null)

export function WindowsProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<AppWindow[]>([])
  const [activeId, setActiveId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeWindows(ws => {
      setWindows(ws)
      if (ws.length && !activeId) setActiveId(ws[0].id)
      setLoading(false)
    })
    return unsub
  }, [])

  const activeWindow = windows.find(w => w.id === activeId) ?? null

  const addWindow = async (title: string, slug: string, themeKey: string) => {
    const theme = THEMES[themeKey] ?? THEMES.dark
    await createWindow({
      title,
      slug:  slug || title.toLowerCase().replace(/\s+/g, '-'),
      order: windows.length,
      theme,
    })
  }

  const editWindow = async (id: string, data: Partial<AppWindow>) => {
    await updateWindow(id, data)
  }

  const removeWindow = async (id: string) => {
    await deleteWindow(id)
    if (activeId === id && windows.length > 1) {
      setActiveId(windows.find(w => w.id !== id)?.id ?? '')
    }
  }

  return (
    <WindowsContext.Provider value={{
      windows, activeId, setActiveId, activeWindow,
      addWindow, editWindow, removeWindow, loading,
    }}>
      {children}
    </WindowsContext.Provider>
  )
}

export function useWindows() {
  const ctx = useContext(WindowsContext)
  if (!ctx) throw new Error('useWindows must be inside WindowsProvider')
  return ctx
}
