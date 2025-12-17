import jsPDF from "jspdf"
import type { Layout, Table, Column, DanceFloor, BandArea } from "./types"

export const generateUniqueId = (): string => {
  return `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const saveLayout = (layout: Layout): void => {
  try {
    localStorage.setItem("seating-layout", JSON.stringify(layout))
  } catch (error) {
    console.error("Failed to save layout:", error)
  }
}

export const loadLayout = (): Layout | null => {
  try {
    const saved = localStorage.getItem("seating-layout")
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error("Failed to load layout:", error)
    return null
  }
}

interface ExportData {
  tables: Table[]
  columns: Column[]
  danceFloor: DanceFloor | null
  bandArea: BandArea | null
  hallWidth: number
  hallHeight: number
  showDanceFloor: boolean
  showBandArea: boolean
  showLabels: boolean
  doors: { x: number; y: number; width: number; height: number; label: string; rotation?: number }[]
}

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

const getTableDimensionsForExport = (type: string, rotation: number) => {
  // Square table: 1.50m x 1.50m = 75px at scale 50
  // Rectangular table: 2.48m x 1.20m = 124px x 60px at scale 50
  // Head table: 2.48m x 1.20m = 124px x 60px at scale 50
  let width = 75
  let height = 75

  if (type === "head") {
    width = 124
    height = 60
  } else if (type === "rectangular") {
    width = 124
    height = 60
  }

  if (rotation === 90 || rotation === 270) {
    return { width: height, height: width }
  }

  return { width, height }
}

const renderCanvasToNative = (ctx: CanvasRenderingContext2D, data: ExportData, scale = 2) => {
  const {
    tables,
    columns,
    danceFloor,
    bandArea,
    hallWidth,
    hallHeight,
    showDanceFloor,
    showBandArea,
    showLabels,
    doors,
  } = data

  // Background
  ctx.fillStyle = "#f8f9fa"
  ctx.fillRect(0, 0, hallWidth * scale, hallHeight * scale)

  // Grid
  ctx.strokeStyle = "#e5e7eb"
  ctx.lineWidth = 0.5
  for (let x = 0; x <= hallWidth; x += 50) {
    ctx.beginPath()
    ctx.moveTo(x * scale, 0)
    ctx.lineTo(x * scale, hallHeight * scale)
    ctx.stroke()
  }
  for (let y = 0; y <= hallHeight; y += 50) {
    ctx.beginPath()
    ctx.moveTo(0, y * scale)
    ctx.lineTo(hallWidth * scale, y * scale)
    ctx.stroke()
  }

  // Border
  ctx.strokeStyle = "#d1d5db"
  ctx.lineWidth = 2 * scale
  ctx.strokeRect(0, 0, hallWidth * scale, hallHeight * scale)

  // Columns (green)
  columns.forEach((column) => {
    ctx.fillStyle = "#16a34a"
    ctx.fillRect(column.x * scale, column.y * scale, column.width * scale, column.height * scale)
    ctx.strokeStyle = "#15803d"
    ctx.lineWidth = 2 * scale
    ctx.strokeRect(column.x * scale, column.y * scale, column.width * scale, column.height * scale)
  })

  // Dance floor (blue)
  if (showDanceFloor && danceFloor) {
    ctx.fillStyle = "#2563eb"
    drawRoundedRect(
      ctx,
      danceFloor.x * scale,
      danceFloor.y * scale,
      danceFloor.width * scale,
      danceFloor.height * scale,
      8 * scale,
    )
    ctx.fill()
    ctx.strokeStyle = "#1d4ed8"
    ctx.lineWidth = 2 * scale
    ctx.stroke()

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.font = `bold ${14 * scale}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(
      "Pista de Baile",
      (danceFloor.x + danceFloor.width / 2) * scale,
      (danceFloor.y + danceFloor.height / 2) * scale,
    )
  }

  // Band area (indigo)
  if (showBandArea && bandArea) {
    ctx.fillStyle = "#4338ca"
    drawRoundedRect(
      ctx,
      bandArea.x * scale,
      bandArea.y * scale,
      bandArea.width * scale,
      bandArea.height * scale,
      8 * scale,
    )
    ctx.fill()
    ctx.strokeStyle = "#3730a3"
    ctx.lineWidth = 2 * scale
    ctx.stroke()

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.font = `bold ${12 * scale}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Área de Banda", (bandArea.x + bandArea.width / 2) * scale, (bandArea.y + bandArea.height / 2) * scale)
  }

  // Doors (amber)
  doors.forEach((door) => {
    ctx.fillStyle = "#f59e0b"
    ctx.fillRect(door.x * scale, door.y * scale, door.width * scale, door.height * scale)
    ctx.strokeStyle = "#d97706"
    ctx.lineWidth = 2 * scale
    ctx.strokeRect(door.x * scale, door.y * scale, door.width * scale, door.height * scale)

    ctx.save()
    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${10 * scale}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const centerX = (door.x + door.width / 2) * scale
    const centerY = (door.y + door.height / 2) * scale

    if (door.rotation) {
      ctx.translate(centerX, centerY)
      ctx.rotate((door.rotation * Math.PI) / 180)
      ctx.fillText(door.label, 0, 0)
    } else {
      ctx.fillText(door.label, centerX, centerY)
    }
    ctx.restore()
  })

  // Tables
  tables.forEach((table) => {
    const dims = getTableDimensionsForExport(table.type, table.rotation)
    const tableX = table.x * scale
    const tableY = table.y * scale
    const tableW = dims.width * scale
    const tableH = dims.height * scale

    ctx.save()
    ctx.translate(tableX + tableW / 2, tableY + tableH / 2)

    // Table background
    ctx.fillStyle = "#ffffff"
    drawRoundedRect(ctx, -tableW / 2, -tableH / 2, tableW, tableH, 4 * scale)
    ctx.fill()
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 2 * scale
    ctx.stroke()

    // Table label
    if (showLabels) {
      ctx.fillStyle = "#374151"
      ctx.font = `bold ${12 * scale}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      if (table.type === "head") {
        ctx.fillText("Principal", 0, -8 * scale)
        ctx.font = `${10 * scale}px sans-serif`
        ctx.fillText(`${table.capacity} personas`, 0, 8 * scale)
      } else {
        ctx.fillText(`Mesa ${table.number}`, 0, table.note && table.capacity === 0 ? 0 : -4 * scale)
        if (table.capacity > 0) {
          ctx.font = `${10 * scale}px sans-serif`
          ctx.fillStyle = "#6b7280"
          ctx.fillText(`${table.capacity} personas`, 0, 10 * scale)
        } else if (table.note) {
          ctx.font = `${9 * scale}px sans-serif`
          ctx.fillStyle = "#6b7280"
          ctx.fillText(table.note, 0, 10 * scale)
        }
      }
    }

    // Guest circles
    if (table.capacity > 0) {
      const circleRadius = 6 * scale
      const circleOffset = 12 * scale

      ctx.fillStyle = "#1f2937"

      if (table.type === "head") {
        // Head table: max 3 on top, 1 per side
        const topCount = Math.min(table.capacity, 3)
        const remaining = table.capacity - topCount
        const leftCount = remaining > 0 ? 1 : 0
        const rightCount = remaining > 1 ? 1 : 0

        // Top guests
        for (let i = 0; i < topCount; i++) {
          const spacing = tableW / (topCount + 1)
          const gx = -tableW / 2 + spacing * (i + 1)
          const gy = -tableH / 2 - circleOffset
          ctx.beginPath()
          ctx.arc(gx, gy, circleRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        // Left guest
        if (leftCount > 0) {
          ctx.beginPath()
          ctx.arc(-tableW / 2 - circleOffset, 0, circleRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        // Right guest
        if (rightCount > 0) {
          ctx.beginPath()
          ctx.arc(tableW / 2 + circleOffset, 0, circleRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (table.type === "square") {
        // Square table: distribute evenly on all 4 sides
        const perSide = Math.ceil(table.capacity / 4)
        const sides = [
          { count: Math.min(perSide, table.capacity), side: "top" },
          { count: Math.min(perSide, Math.max(0, table.capacity - perSide)), side: "right" },
          { count: Math.min(perSide, Math.max(0, table.capacity - perSide * 2)), side: "bottom" },
          { count: Math.min(perSide, Math.max(0, table.capacity - perSide * 3)), side: "left" },
        ]

        sides.forEach(({ count, side }) => {
          for (let i = 0; i < count; i++) {
            let gx = 0,
              gy = 0
            const spacing = tableW / (count + 1)

            if (side === "top") {
              gx = -tableW / 2 + spacing * (i + 1)
              gy = -tableH / 2 - circleOffset
            } else if (side === "bottom") {
              gx = -tableW / 2 + spacing * (i + 1)
              gy = tableH / 2 + circleOffset
            } else if (side === "left") {
              gx = -tableW / 2 - circleOffset
              gy = -tableH / 2 + (tableH / (count + 1)) * (i + 1)
            } else if (side === "right") {
              gx = tableW / 2 + circleOffset
              gy = -tableH / 2 + (tableH / (count + 1)) * (i + 1)
            }

            ctx.beginPath()
            ctx.arc(gx, gy, circleRadius, 0, Math.PI * 2)
            ctx.fill()
          }
        })
      } else if (table.type === "rectangular") {
        // Rectangular: 14 max = 5-2-5-2 pattern
        let topCount, bottomCount, leftCount, rightCount

        if (table.capacity === 14) {
          topCount = 5
          bottomCount = 5
          leftCount = 2
          rightCount = 2
        } else {
          const total = table.capacity
          topCount = Math.ceil(total * 0.35)
          bottomCount = Math.ceil(total * 0.35)
          const remaining = total - topCount - bottomCount
          leftCount = Math.floor(remaining / 2)
          rightCount = remaining - leftCount
        }

        // Top
        for (let i = 0; i < topCount; i++) {
          const spacing = tableW / (topCount + 1)
          ctx.beginPath()
          ctx.arc(-tableW / 2 + spacing * (i + 1), -tableH / 2 - circleOffset, circleRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        // Bottom
        for (let i = 0; i < bottomCount; i++) {
          const spacing = tableW / (bottomCount + 1)
          ctx.beginPath()
          ctx.arc(-tableW / 2 + spacing * (i + 1), tableH / 2 + circleOffset, circleRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        // Left
        for (let i = 0; i < leftCount; i++) {
          const spacing = tableH / (leftCount + 1)
          ctx.beginPath()
          ctx.arc(-tableW / 2 - circleOffset, -tableH / 2 + spacing * (i + 1), circleRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        // Right
        for (let i = 0; i < rightCount; i++) {
          const spacing = tableH / (rightCount + 1)
          ctx.beginPath()
          ctx.arc(tableW / 2 + circleOffset, -tableH / 2 + spacing * (i + 1), circleRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    ctx.restore()
  })
}

export const exportCanvasAsPNG = async (
  element: HTMLElement,
  filename: string,
  exportData: ExportData,
): Promise<void> => {
  try {
    const scale = 2
    const canvas = document.createElement("canvas")
    canvas.width = exportData.hallWidth * scale
    canvas.height = exportData.hallHeight * scale

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Could not get canvas context")

    renderCanvasToNative(ctx, exportData, scale)

    const link = document.createElement("a")
    link.download = filename
    link.href = canvas.toDataURL("image/png")
    link.click()
  } catch (error) {
    console.error("Failed to export PNG:", error)
    throw error
  }
}

export const exportCanvasAsPDF = async (
  element: HTMLElement,
  filename: string,
  exportData: ExportData,
): Promise<void> => {
  try {
    const scale = 2
    const canvas = document.createElement("canvas")
    canvas.width = exportData.hallWidth * scale
    canvas.height = exportData.hallHeight * scale

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Could not get canvas context")

    renderCanvasToNative(ctx, exportData, scale)

    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    const pdfWidth = 297
    const pdfHeight = 210

    const imgRatio = exportData.hallWidth / exportData.hallHeight
    const pdfRatio = pdfWidth / pdfHeight

    let finalWidth = pdfWidth
    let finalHeight = pdfHeight
    let offsetX = 0
    let offsetY = 0

    if (imgRatio > pdfRatio) {
      finalHeight = pdfWidth / imgRatio
      offsetY = (pdfHeight - finalHeight) / 2
    } else {
      finalWidth = pdfHeight * imgRatio
      offsetX = (pdfWidth - finalWidth) / 2
    }

    pdf.addImage(imgData, "PNG", offsetX, offsetY, finalWidth, finalHeight)
    pdf.save(filename)
  } catch (error) {
    console.error("Failed to export PDF:", error)
    throw error
  }
}

export const checkRectOverlap = (
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number },
): boolean => {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  )
}

export const getTableDimensions = (type: string, rotation: number) => {
  let width = 75
  let height = 75

  if (type === "head") {
    width = 124
    height = 60
  } else if (type === "rectangular") {
    width = 124
    height = 60
  }

  if (rotation === 90 || rotation === 270) {
    return { width: height, height: width }
  }

  return { width, height }
}

export const metersToPixels = (meters: number, scale: number): number => {
  return Math.round(meters * scale)
}

export const pixelsToMeters = (pixels: number, scale: number): number => {
  return Math.round((pixels / scale) * 100) / 100
}
