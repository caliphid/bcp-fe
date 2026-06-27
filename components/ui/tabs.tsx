"use client"

import React, { createContext, useContext, useState } from "react"
import { cn } from "../../lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange, 
  className, 
  children 
}: { 
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode 
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || "")
  
  const isControlled = value !== undefined
  const activeValue = isControlled ? value : uncontrolledValue
  const setActiveValue = isControlled && onValueChange ? onValueChange : setUncontrolledValue

  return (
    <TabsContext.Provider value={{ value: activeValue as string, onValueChange: setActiveValue }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ 
  value, 
  className, 
  children 
}: { 
  value: string
  className?: string
  children: React.ReactNode 
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")
  
  const isActive = context.value === value
  
  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-white text-slate-950 shadow-sm" 
          : "hover:bg-slate-200 hover:text-slate-900",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ 
  value, 
  className, 
  children 
}: { 
  value: string
  className?: string
  children: React.ReactNode 
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")
  
  if (context.value !== value) return null
  
  return (
    <div className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2", className)}>
      {children}
    </div>
  )
}
