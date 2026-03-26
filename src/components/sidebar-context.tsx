'use client'

import { createContext, useContext, useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'sidebar-collapsed'

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === '1'
}

function getServerSnapshot() {
  return false
}

interface SidebarContextValue {
  collapsed: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue>({ collapsed: false, toggle: () => {} })

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback(() => {
    const current = localStorage.getItem(STORAGE_KEY) === '1'
    localStorage.setItem(STORAGE_KEY, current ? '0' : '1')
    window.dispatchEvent(new StorageEvent('storage'))
  }, [])

  return <SidebarContext.Provider value={{ collapsed, toggle }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  return useContext(SidebarContext)
}
