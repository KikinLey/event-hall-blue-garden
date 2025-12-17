"use client"

import { useDraggable } from "@dnd-kit/core"
import { Music, Grip } from "lucide-react"
import type { DanceFloor, BandArea, Column } from "@/lib/types"

interface DraggableFixedElementProps {
  id: string
  type: "danceFloor" | "bandArea"
  element: DanceFloor | BandArea
  onUpdate: (updates: Partial<DanceFloor | BandArea>) => void
  hallWidth: number
  hallHeight: number
  columns: Column[]
  showColumns: boolean
  danceFloor?: DanceFloor
  onCollisionWarning: (message: string) => void
}

export default function DraggableFixedElement({
  id,
  type,
  element,
  hallWidth,
  hallHeight,
  columns,
  showColumns,
  danceFloor,
  onCollisionWarning,
}: DraggableFixedElementProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: element.locked,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const bgColor = type === "danceFloor" ? "bg-blue-500/40" : "bg-indigo-600/40"
  const borderColor = type === "danceFloor" ? "border-blue-600" : "border-indigo-700"
  const label = type === "danceFloor" ? "Dance Floor" : "Band Area"
  const icon = type === "danceFloor" ? Grip : Music

  const Icon = icon

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
      }}
      className={`absolute ${bgColor} ${borderColor} border-2 rounded-lg ${
        isDragging ? "opacity-50 z-50" : "z-10"
      } ${element.locked ? "cursor-not-allowed" : "cursor-move"} transition-opacity`}
      {...listeners}
      {...attributes}
    >
      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 text-white font-semibold text-lg">
          <Icon className="h-6 w-6" />
          {label}
        </div>
      </div>

      {/* Lock indicator */}
      {element.locked && (
        <div className="absolute top-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded pointer-events-none">
          Locked
        </div>
      )}
    </div>
  )
}
