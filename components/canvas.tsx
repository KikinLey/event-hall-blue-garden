"use client"

import { forwardRef } from "react"
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors, KeyboardSensor } from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import type { Table, Column, DanceFloor, BandArea } from "@/lib/types"
import DraggableTable from "./draggable-table"
import { checkRectOverlap, getTableDimensions } from "@/lib/utils-seating"

interface CanvasProps {
  tables: Table[]
  hallWidth: number
  hallHeight: number
  showLabels: boolean
  selectedTableId: string | null
  onSelectTable: (id: string | null) => void
  onUpdateTable: (id: string, updates: Partial<Table>) => void
  columns: Column[]
  danceFloor: DanceFloor | null
  bandArea: BandArea | null
  showDanceFloor: boolean
  showBandArea: boolean
  onCollisionWarning: (message: string) => void
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  (
    {
      tables,
      hallWidth,
      hallHeight,
      showLabels,
      selectedTableId,
      onSelectTable,
      onUpdateTable,
      columns,
      danceFloor,
      bandArea,
      showDanceFloor,
      showBandArea,
      onCollisionWarning,
    },
    ref,
  ) => {
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      }),
      useSensor(KeyboardSensor),
    )

    const checkTableCollision = (tableId: string, newX: number, newY: number): boolean => {
      const table = tables.find((t) => t.id === tableId)
      if (!table) return false

      const tableDims = getTableDimensions(table.type, table.rotation)
      const tableRect = { x: newX, y: newY, width: tableDims.width, height: tableDims.height }

      // Check collision with columns (always visible)
      for (const column of columns) {
        if (checkRectOverlap(tableRect, column)) {
          onCollisionWarning("La mesa no puede superponerse con las columnas")
          return true
        }
      }

      // Check collision with dance floor
      if (showDanceFloor && danceFloor) {
        if (checkRectOverlap(tableRect, danceFloor)) {
          onCollisionWarning("La mesa no puede superponerse con la pista de baile")
          return true
        }
      }

      // Check collision with band area
      if (showBandArea && bandArea) {
        if (checkRectOverlap(tableRect, bandArea)) {
          onCollisionWarning("La mesa no puede superponerse con el área de banda")
          return true
        }
      }

      return false
    }

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, delta } = event
      const activeId = active.id.toString()

      const table = tables.find((t) => t.id === activeId)
      if (table) {
        const newX = Math.max(0, Math.min(hallWidth - 100, table.x + delta.x))
        const newY = Math.max(0, Math.min(hallHeight - 100, table.y + delta.y))

        if (!checkTableCollision(activeId, newX, newY)) {
          onUpdateTable(table.id, { x: newX, y: newY })
        }
      }
    }

    return (
      <div
        ref={ref}
        className="relative bg-muted/30 border-2 border-border rounded-lg"
        style={{
          width: hallWidth,
          height: hallHeight,
          minWidth: hallWidth,
          minHeight: hallHeight,
        }}
      >
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          {columns.map((column) => (
            <div
              key={column.id}
              className="absolute bg-green-600 border-2 border-green-700 rounded-sm shadow-md pointer-events-none"
              style={{
                left: column.x,
                top: column.y,
                width: column.width,
                height: column.height,
              }}
              title="Columna Estructural"
            />
          ))}

          {showDanceFloor && danceFloor && (
            <div
              className="absolute bg-blue-600 border-2 border-blue-700 rounded-lg shadow-lg pointer-events-none flex items-center justify-center"
              style={{
                left: danceFloor.x,
                top: danceFloor.y,
                width: danceFloor.width,
                height: danceFloor.height,
              }}
            >
              <span className="text-white text-sm font-semibold opacity-70">Pista de Baile</span>
            </div>
          )}

          {showBandArea && bandArea && (
            <div
              className="absolute bg-indigo-700 border-2 border-indigo-800 rounded-lg shadow-lg pointer-events-none flex items-center justify-center"
              style={{
                left: bandArea.x,
                top: bandArea.y,
                width: bandArea.width,
                height: bandArea.height,
              }}
            >
              <span className="text-white text-xs font-semibold opacity-70">Área de Banda</span>
            </div>
          )}

          {/* Entrada Principal - left side, bottom 3 squares */}
          <div
            className="absolute bg-amber-500 border-2 border-amber-600 rounded flex items-center justify-center pointer-events-none"
            style={{
              left: 0,
              top: hallHeight - 150, // 3 grid squares from bottom
              width: 40,
              height: 150,
            }}
          >
            <span className="text-white text-xs font-bold transform -rotate-90 whitespace-nowrap">
              Entrada Principal
            </span>
          </div>

          {/* Puerta a jardines - top horizontal, squares 11, 12, 13 from left */}
          <div
            className="absolute bg-amber-500 border-2 border-amber-600 rounded flex items-center justify-center pointer-events-none"
            style={{
              left: 550, // Grid square 11 (50px per square, 11 * 50 = 550)
              top: 0,
              width: 150, // 3 grid squares wide (3 * 50 = 150)
              height: 40,
            }}
          >
            <span className="text-white text-xs font-bold whitespace-nowrap">Puerta a Jardines</span>
          </div>

          {/* Tables */}
          {tables.map((table) => (
            <DraggableTable
              key={table.id}
              table={table}
              showLabel={showLabels}
              isSelected={selectedTableId === table.id}
              onSelect={() => onSelectTable(table.id)}
            />
          ))}
        </DndContext>

        {/* Grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    )
  },
)

Canvas.displayName = "Canvas"

export default Canvas
