"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Canvas from "./canvas"
import ControlPanel from "./control-panel"
import type { Table, TableType, Column, DanceFloor, BandArea } from "@/lib/types"
import { exportCanvasAsPNG, exportCanvasAsPDF, loadLayout, generateUniqueId, metersToPixels } from "@/lib/utils-seating"
import { Download, Trash2, FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const HALL_WIDTH_METERS = 26.67
const HALL_HEIGHT_METERS = 13.9
const DANCE_FLOOR_WIDTH_METERS = 6.63
const DANCE_FLOOR_HEIGHT_METERS = 4.81
const BAND_AREA_WIDTH_METERS = 5.3
const BAND_AREA_HEIGHT_METERS = 2.74
const SCALE = 50
const COLUMN_SIZE_METERS = 0.36

export default function SeatingLayoutDesigner() {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [hallWidth] = useState(metersToPixels(HALL_WIDTH_METERS, SCALE))
  const [hallHeight] = useState(metersToPixels(HALL_HEIGHT_METERS, SCALE))
  const [showLabels, setShowLabels] = useState(true)

  const bandAreaWidth = metersToPixels(BAND_AREA_WIDTH_METERS, SCALE)
  const bandAreaHeight = metersToPixels(BAND_AREA_HEIGHT_METERS, SCALE)
  const danceFloorWidth = metersToPixels(DANCE_FLOOR_WIDTH_METERS, SCALE)
  const danceFloorHeight = metersToPixels(DANCE_FLOOR_HEIGHT_METERS, SCALE)

  const bandAreaX = 200 + 50 * 2
  const bandAreaY = hallHeight - bandAreaHeight - 20 + 25 - 10

  const danceFloorX = hallWidth / 2 - danceFloorWidth / 2
  const danceFloorY = hallHeight / 2 - danceFloorHeight / 2 - 40

  const columnSize = metersToPixels(COLUMN_SIZE_METERS, SCALE)

  const [columns] = useState<Column[]>([
    {
      id: "col-1",
      x: bandAreaX,
      y: danceFloorY + danceFloorHeight / 2 - columnSize / 2 - 75,
      width: columnSize,
      height: columnSize,
    },
    {
      id: "col-2",
      x: danceFloorX + danceFloorWidth + 40 + 25,
      y: danceFloorY + danceFloorHeight / 2 - columnSize / 2 - 75,
      width: columnSize,
      height: columnSize,
    },
    {
      id: "col-3",
      x: bandAreaX,
      y: bandAreaY - columnSize - 5,
      width: columnSize,
      height: columnSize,
    },
    {
      id: "col-4",
      x: bandAreaX + bandAreaWidth - columnSize,
      y: bandAreaY - columnSize - 5,
      width: columnSize,
      height: columnSize,
    },
    {
      id: "col-5",
      x: danceFloorX + danceFloorWidth + 40 + 25,
      y: bandAreaY - columnSize - 5,
      width: columnSize,
      height: columnSize,
    },
  ])

  const [danceFloor, setDanceFloor] = useState<DanceFloor>({
    x: danceFloorX,
    y: danceFloorY,
    width: danceFloorWidth,
    height: danceFloorHeight,
    locked: true,
  })

  const [bandArea, setBandArea] = useState<BandArea>({
    x: bandAreaX,
    y: bandAreaY,
    width: bandAreaWidth,
    height: bandAreaHeight,
    locked: true,
  })

  const [showColumns] = useState(true)
  const [showDanceFloor, setShowDanceFloor] = useState(true)
  const [showBandArea, setShowBandArea] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const doors = [
    { x: 0, y: hallHeight - 150, width: 40, height: 150, label: "Entrada Principal", rotation: -90 },
    { x: 500, y: 0, width: 150, height: 40, label: "Puerta a Jardines", rotation: 0 },
  ]

  useState(() => {
    const loaded = loadLayout()
    if (loaded) {
      setTables(loaded.tables)
      if (loaded.showDanceFloor !== undefined) setShowDanceFloor(loaded.showDanceFloor)
      if (loaded.showBandArea !== undefined) setShowBandArea(loaded.showBandArea)
    }
  })

  const addTable = (type: TableType) => {
    if (type === "head") {
      const existingHead = tables.find((t) => t.type === "head")
      if (existingHead) {
        toast({
          title: "Límite alcanzado",
          description: "Solo se permite una mesa principal.",
          variant: "destructive",
        })
        return
      }
    }

    if (type === "rectangular") {
      const rectangularCount = tables.filter((t) => t.type === "rectangular").length
      if (rectangularCount >= 7) {
        toast({
          title: "Límite alcanzado",
          description: "Máximo 7 mesas rectangulares permitidas.",
          variant: "destructive",
        })
        return
      }
    }

    const newTable: Table = {
      id: generateUniqueId(),
      type,
      x: 100,
      y: 100,
      rotation: 0,
      capacity: type === "head" ? 2 : type === "square" ? 8 : 10,
      number: tables.length + 1,
      note: "",
    }

    setTables([...tables, newTable])
    toast({
      title: "Mesa agregada",
      description: `Mesa ${type === "head" ? "principal" : type === "square" ? "cuadrada" : "rectangular"} agregada exitosamente.`,
    })
  }

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(tables.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const deleteTable = (id: string) => {
    setTables(tables.filter((t) => t.id !== id))
    if (selectedTableId === id) {
      setSelectedTableId(null)
    }
    toast({
      title: "Mesa eliminada",
      description: "Mesa removida del diseño.",
    })
  }

  const duplicateTable = (id: string) => {
    const table = tables.find((t) => t.id === id)
    if (!table) return

    if (table.type === "head") {
      toast({
        title: "No se puede duplicar",
        description: "Solo se permite una mesa principal.",
        variant: "destructive",
      })
      return
    }

    if (table.type === "rectangular") {
      const rectangularCount = tables.filter((t) => t.type === "rectangular").length
      if (rectangularCount >= 7) {
        toast({
          title: "Límite alcanzado",
          description: "Máximo 7 mesas rectangulares permitidas.",
          variant: "destructive",
        })
        return
      }
    }

    const newTable: Table = {
      ...table,
      id: generateUniqueId(),
      x: table.x + 40,
      y: table.y + 40,
      number: tables.length + 1,
    }

    setTables([...tables, newTable])
    toast({
      title: "Mesa duplicada",
      description: "Mesa copiada exitosamente.",
    })
  }

  const rotateTable = (id: string) => {
    const table = tables.find((t) => t.id === id)
    if (table) {
      updateTable(id, { rotation: (table.rotation + 90) % 360 })
    }
  }

  const autoRenumberTables = () => {
    const renumbered = tables.map((table, index) => ({
      ...table,
      number: index + 1,
    }))
    setTables(renumbered)
    toast({
      title: "Mesas renumeradas",
      description: "Todas las mesas han sido renumeradas secuencialmente.",
    })
  }

  const handleExportPNG = async () => {
    if (!canvasRef.current) return

    try {
      const exportData = {
        tables,
        columns,
        danceFloor: showDanceFloor ? danceFloor : null,
        bandArea: showBandArea ? bandArea : null,
        hallWidth,
        hallHeight,
        showDanceFloor,
        showBandArea,
        showLabels,
        doors,
      }

      await exportCanvasAsPNG(canvasRef.current, "diseño-mesas-blue-garden.png", exportData)
      toast({
        title: "PNG exportado",
        description: "Diseño guardado como imagen PNG.",
      })
    } catch (error) {
      console.error("Error exporting PNG:", error)
      toast({
        title: "Error al exportar",
        description: error instanceof Error ? error.message : "No se pudo generar el archivo PNG.",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = async () => {
    if (!canvasRef.current) return

    try {
      const exportData = {
        tables,
        columns,
        danceFloor: showDanceFloor ? danceFloor : null,
        bandArea: showBandArea ? bandArea : null,
        hallWidth,
        hallHeight,
        showDanceFloor,
        showBandArea,
        showLabels,
        doors,
      }

      await exportCanvasAsPDF(canvasRef.current, "diseño-mesas-blue-garden.pdf", exportData)
      toast({
        title: "PDF exportado",
        description: "Diseño guardado como archivo PDF.",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Error al exportar",
        description: error instanceof Error ? error.message : "No se pudo generar el archivo PDF.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    if (confirm("¿Estás seguro de que quieres eliminar todas las mesas?")) {
      setTables([])
      setSelectedTableId(null)
      toast({
        title: "Diseño limpiado",
        description: "Todas las mesas han sido removidas.",
      })
    }
  }

  const selectedTable = tables.find((t) => t.id === selectedTableId)

  const handleCollisionWarning = (message: string) => {
    toast({
      title: "Ubicación inválida",
      description: message,
      variant: "destructive",
    })
  }

  return (
    <div className="flex h-screen w-full gap-4 p-4 bg-background">
      <ControlPanel
        onAddTable={addTable}
        rectangularCount={tables.filter((t) => t.type === "rectangular").length}
        hasHeadTable={tables.some((t) => t.type === "head")}
        hallWidth={hallWidth}
        hallHeight={hallHeight}
        hallWidthMeters={HALL_WIDTH_METERS}
        hallHeightMeters={HALL_HEIGHT_METERS}
        danceFloorWidthMeters={DANCE_FLOOR_WIDTH_METERS}
        danceFloorHeightMeters={DANCE_FLOOR_HEIGHT_METERS}
        bandAreaWidthMeters={BAND_AREA_WIDTH_METERS}
        bandAreaHeightMeters={BAND_AREA_HEIGHT_METERS}
        onAutoRenumber={autoRenumberTables}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        selectedTable={selectedTable}
        onUpdateCapacity={(capacity) => selectedTable && updateTable(selectedTable.id, { capacity })}
        onUpdateNote={(note) => selectedTable && updateTable(selectedTable.id, { note })}
        onRotate={() => selectedTable && rotateTable(selectedTable.id)}
        onDuplicate={() => selectedTable && duplicateTable(selectedTable.id)}
        onDelete={() => selectedTable && deleteTable(selectedTable.id)}
        showColumns={showColumns}
        onToggleColumns={() => {}}
        showDanceFloor={showDanceFloor}
        onToggleDanceFloor={() => setShowDanceFloor(!showDanceFloor)}
        showBandArea={showBandArea}
        onToggleBandArea={() => setShowBandArea(!showBandArea)}
        danceFloorLocked={danceFloor.locked}
        onToggleDanceFloorLock={() => {}}
        bandAreaLocked={bandArea.locked}
        onToggleBandAreaLock={() => {}}
      />

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <Card className="p-4 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleExportPNG} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar PNG
            </Button>
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar Todo
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              Total Mesas: {tables.length} | Capacidad Total: {tables.reduce((sum, t) => sum + t.capacity, 0)}
            </div>
          </div>
        </Card>

        <div className="flex-1 overflow-auto">
          <Canvas
            ref={canvasRef}
            tables={tables}
            hallWidth={hallWidth}
            hallHeight={hallHeight}
            showLabels={showLabels}
            selectedTableId={selectedTableId}
            onSelectTable={setSelectedTableId}
            onUpdateTable={updateTable}
            columns={columns}
            danceFloor={danceFloor}
            bandArea={bandArea}
            showColumns={showColumns}
            showDanceFloor={showDanceFloor}
            showBandArea={showBandArea}
            onUpdateDanceFloor={(updates) => setDanceFloor({ ...danceFloor, ...updates })}
            onUpdateBandArea={(updates) => setBandArea({ ...bandArea, ...updates })}
            onCollisionWarning={handleCollisionWarning}
          />
        </div>
      </div>
    </div>
  )
}
