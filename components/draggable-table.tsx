"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import type { Table } from "@/lib/types"
import { cn } from "@/lib/utils"

const SCALE = 50
const SQUARE_TABLE_SIZE = 1.5 * SCALE // 1.50m × 1.50m = 75px
const RECTANGULAR_WIDTH = 2.48 * SCALE // 2.48m = 124px
const RECTANGULAR_HEIGHT = 1.2 * SCALE // 1.20m = 60px
const HEAD_TABLE_WIDTH = 120
const HEAD_TABLE_HEIGHT = 60

interface DraggableTableProps {
  table: Table
  showLabel: boolean
  isSelected: boolean
  onSelect: () => void
}

export default function DraggableTable({ table, showLabel, isSelected, onSelect }: DraggableTableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    left: table.x,
    top: table.y,
    cursor: isDragging ? "grabbing" : "grab",
  }

  const getTableDimensions = () => {
    switch (table.type) {
      case "head":
        return { width: HEAD_TABLE_WIDTH, height: HEAD_TABLE_HEIGHT }
      case "square":
        return { width: SQUARE_TABLE_SIZE, height: SQUARE_TABLE_SIZE }
      case "rectangular":
        return { width: RECTANGULAR_WIDTH, height: RECTANGULAR_HEIGHT }
    }
  }

  const { width, height } = getTableDimensions()

  const truncatedNote = table.note ? (table.note.length > 25 ? table.note.substring(0, 25) + "..." : table.note) : ""

  const renderChairs = () => {
    const chairs = []
    const chairSize = 14
    const gap = 8

    if (table.type === "head") {
      const topChairs = Math.min(table.capacity, 3)
      const remainingChairs = table.capacity - topChairs
      const leftChairs = remainingChairs > 0 ? 1 : 0
      const rightChairs = remainingChairs > 1 ? 1 : 0

      // Top (max 3)
      if (topChairs > 0) {
        const topSpacing = (width - gap * 2) / (topChairs + 1)
        for (let i = 0; i < topChairs; i++) {
          chairs.push(
            <circle
              key={`chair-top-${i}`}
              cx={gap + topSpacing * (i + 1)}
              cy={-chairSize / 2 - 4}
              r={chairSize / 2}
              className="fill-primary"
            />,
          )
        }
      }

      // Left (1 person)
      if (leftChairs > 0) {
        chairs.push(
          <circle
            key="chair-left"
            cx={-chairSize / 2 - 4}
            cy={height / 2}
            r={chairSize / 2}
            className="fill-primary"
          />,
        )
      }

      // Right (1 person)
      if (rightChairs > 0) {
        chairs.push(
          <circle
            key="chair-right"
            cx={width + chairSize / 2 + 4}
            cy={height / 2}
            r={chairSize / 2}
            className="fill-primary"
          />,
        )
      }
    } else if (table.type === "square") {
      const perSide = Math.floor(table.capacity / 4)
      const extra = table.capacity % 4

      // Top
      const topChairs = perSide + (extra > 0 ? 1 : 0)
      const topSpacing = (width - gap * 2) / (topChairs + 1)
      for (let i = 0; i < topChairs; i++) {
        chairs.push(
          <circle
            key={`chair-top-${i}`}
            cx={gap + topSpacing * (i + 1)}
            cy={-chairSize / 2 - 4}
            r={chairSize / 2}
            className="fill-primary"
          />,
        )
      }

      // Right
      const rightChairs = perSide + (extra > 1 ? 1 : 0)
      const rightSpacing = (height - gap * 2) / (rightChairs + 1)
      for (let i = 0; i < rightChairs; i++) {
        chairs.push(
          <circle
            key={`chair-right-${i}`}
            cx={width + chairSize / 2 + 4}
            cy={gap + rightSpacing * (i + 1)}
            r={chairSize / 2}
            className="fill-primary"
          />,
        )
      }

      // Bottom
      const bottomChairs = perSide + (extra > 2 ? 1 : 0)
      const bottomSpacing = (width - gap * 2) / (bottomChairs + 1)
      for (let i = 0; i < bottomChairs; i++) {
        chairs.push(
          <circle
            key={`chair-bottom-${i}`}
            cx={gap + bottomSpacing * (i + 1)}
            cy={height + chairSize / 2 + 4}
            r={chairSize / 2}
            className="fill-primary"
          />,
        )
      }

      // Left
      const leftChairs = perSide
      const leftSpacing = (height - gap * 2) / (leftChairs + 1)
      for (let i = 0; i < leftChairs; i++) {
        chairs.push(
          <circle
            key={`chair-left-${i}`}
            cx={-chairSize / 2 - 4}
            cy={gap + leftSpacing * (i + 1)}
            r={chairSize / 2}
            className="fill-primary"
          />,
        )
      }
    } else {
      let topChairs, bottomChairs, leftChairs, rightChairs

      if (table.capacity === 14) {
        // Specific distribution for 14 guests
        topChairs = 5
        bottomChairs = 5
        leftChairs = 2
        rightChairs = 2
      } else {
        // For other capacities, distribute proportionally
        const shortSideMax = 2
        const shortSideChairs = Math.min(shortSideMax * 2, Math.ceil(table.capacity * 0.25))
        const chairsPerShortSide = Math.ceil(shortSideChairs / 2)
        const longSideChairs = table.capacity - shortSideChairs
        const chairsPerLongSide = Math.ceil(longSideChairs / 2)

        topChairs = chairsPerLongSide
        bottomChairs = longSideChairs - chairsPerLongSide
        leftChairs = chairsPerShortSide
        rightChairs = shortSideChairs - chairsPerShortSide
      }

      // Top (long side)
      const topSpacing = (width - gap * 2) / (topChairs + 1)
      for (let i = 0; i < topChairs; i++) {
        chairs.push(
          <circle
            key={`chair-top-${i}`}
            cx={gap + topSpacing * (i + 1)}
            cy={-chairSize / 2 - 4}
            r={chairSize / 2}
            className="fill-primary"
          />,
        )
      }

      // Bottom (long side)
      const bottomSpacing = (width - gap * 2) / (bottomChairs + 1)
      for (let i = 0; i < bottomChairs; i++) {
        chairs.push(
          <circle
            key={`chair-bottom-${i}`}
            cx={gap + bottomSpacing * (i + 1)}
            cy={height + chairSize / 2 + 4}
            r={chairSize / 2}
            className="fill-primary"
          />,
        )
      }

      // Left (short side)
      const leftSpacing = (height - gap * 2) / (leftChairs + 1)
      for (let i = 0; i < leftChairs; i++) {
        chairs.push(
          <circle
            key={`chair-left-${i}`}
            cx={-chairSize / 2 - 4}
            cy={gap + leftSpacing * (i + 1)}
            r={chairSize / 2}
            className="fill-primary"
          />,
        )
      }

      // Right (short side)
      const rightSpacing = (height - gap * 2) / (rightChairs + 1)
      for (let i = 0; i < rightChairs; i++) {
        chairs.push(
          <circle
            key={`chair-right-${i}`}
            cx={width + chairSize / 2 + 4}
            cy={gap + rightSpacing * (i + 1)}
            r={chairSize / 2}
            className="fill-primary"
          />,
        )
      }
    }

    return chairs
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("absolute touch-none select-none", isDragging && "opacity-50 z-50", isSelected && "z-40")}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      {...listeners}
      {...attributes}
    >
      <svg
        width={width + 40}
        height={height + 40}
        style={{
          transform: `rotate(${table.rotation}deg)`,
          transformOrigin: "center",
        }}
      >
        {/* Table */}
        <rect
          x="20"
          y="20"
          width={width}
          height={height}
          rx="8"
          className={cn(
            "fill-card stroke-border",
            isSelected && "stroke-primary stroke-[3]",
            !isSelected && "stroke-[2]",
          )}
        />

        {/* Chairs */}
        <g transform={`translate(20, 20)`}>{renderChairs()}</g>

        {/* Label */}
        {showLabel && (
          <g transform={`translate(${20 + width / 2}, ${20 + height / 2})`}>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              y={table.note ? -8 : -4}
              className="fill-foreground text-sm font-semibold select-none"
              style={{ fontSize: "14px" }}
            >
              {table.number}
            </text>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              y={table.note ? 6 : 10}
              className="fill-muted-foreground text-xs select-none"
              style={{ fontSize: "10px" }}
            >
              {table.capacity === 0
                ? "Decorativa"
                : `${table.type === "head" ? "Princ" : table.type === "square" ? "Cuad" : "Rect"} • ${table.capacity}`}
            </text>
            {truncatedNote && (
              <text
                textAnchor="middle"
                dominantBaseline="central"
                y={18}
                className="fill-accent-foreground text-xs font-medium select-none"
                style={{
                  fontSize: "8px",
                  maxWidth: width - 10,
                }}
              >
                {truncatedNote}
              </text>
            )}
          </g>
        )}
      </svg>
    </div>
  )
}
