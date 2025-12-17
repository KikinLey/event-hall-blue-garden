"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { TableType, Table } from "@/lib/types"
import { Plus, RotateCw, Copy, Trash2, Hash } from "lucide-react"

interface ControlPanelProps {
  onAddTable: (type: TableType) => void
  rectangularCount: number
  hasHeadTable: boolean
  hallWidth: number
  hallHeight: number
  hallWidthMeters: number
  hallHeightMeters: number
  danceFloorWidthMeters: number
  danceFloorHeightMeters: number
  bandAreaWidthMeters: number
  bandAreaHeightMeters: number
  onAutoRenumber: () => void
  showLabels: boolean
  onToggleLabels: () => void
  selectedTable: Table | undefined
  onUpdateCapacity: (capacity: number) => void
  onUpdateNote: (note: string) => void
  onRotate: () => void
  onDuplicate: () => void
  onDelete: () => void
  showColumns: boolean
  onToggleColumns: () => void
  showDanceFloor: boolean
  onToggleDanceFloor: () => void
  showBandArea: boolean
  onToggleBandArea: () => void
  danceFloorLocked: boolean
  onToggleDanceFloorLock: () => void
  bandAreaLocked: boolean
  onToggleBandAreaLock: () => void
}

export default function ControlPanel({
  onAddTable,
  rectangularCount,
  hasHeadTable,
  hallWidthMeters,
  hallHeightMeters,
  danceFloorWidthMeters,
  danceFloorHeightMeters,
  bandAreaWidthMeters,
  bandAreaHeightMeters,
  onAutoRenumber,
  showLabels,
  onToggleLabels,
  selectedTable,
  onUpdateCapacity,
  onUpdateNote,
  onRotate,
  onDuplicate,
  onDelete,
  showDanceFloor,
  onToggleDanceFloor,
  showBandArea,
  onToggleBandArea,
}: ControlPanelProps) {
  const getMaxCapacity = (type: TableType) => {
    if (type === "head") return 5
    if (type === "square") return 12
    return 14
  }

  return (
    <Card className="w-80 h-full overflow-y-auto p-6">
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <img src="/logo-blue-garden.png" alt="Blue Garden" className="w-full h-auto object-contain max-h-24" />
          <h2 className="text-xl font-bold text-center">Diseñador de Mesas</h2>
        </div>

        <Separator />

        {/* Add Tables - All text translated to Spanish */}
        <div className="space-y-3">
          <h3 className="font-semibold">Agregar Mesas</h3>

          <Button
            onClick={() => onAddTable("head")}
            className="w-full justify-start"
            variant="outline"
            disabled={hasHeadTable}
          >
            <Plus className="mr-2 h-4 w-4" />
            Mesa Principal {hasHeadTable && "(1/1)"}
          </Button>
          <div className="text-xs text-muted-foreground pl-1">Capacidad máx: 5 personas</div>

          <Button onClick={() => onAddTable("square")} className="w-full justify-start" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Mesa Cuadrada (1.5m × 1.5m)
          </Button>
          <div className="text-xs text-muted-foreground pl-1">Capacidad máx: 12 personas</div>

          <Button
            onClick={() => onAddTable("rectangular")}
            className="w-full justify-start"
            variant="outline"
            disabled={rectangularCount >= 7}
          >
            <Plus className="mr-2 h-4 w-4" />
            Mesa Rectangular ({rectangularCount}/7)
          </Button>
          <div className="text-xs text-muted-foreground pl-1">2.48m × 1.20m | Capacidad máx: 14 personas</div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold">Elementos Fijos</h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="font-medium">Columnas Estructurales</span>
              <span className="text-xs text-muted-foreground">5 fijas (36cm × 36cm)</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-dance-floor">Pista de Baile</Label>
                <Switch id="show-dance-floor" checked={showDanceFloor} onCheckedChange={onToggleDanceFloor} />
              </div>
              <div className="text-xs text-muted-foreground pl-1">
                {danceFloorWidthMeters}m × {danceFloorHeightMeters}m (Fija)
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-band-area">Área de Banda</Label>
                <Switch id="show-band-area" checked={showBandArea} onCheckedChange={onToggleBandArea} />
              </div>
              <div className="text-xs text-muted-foreground pl-1">
                {bandAreaWidthMeters}m × {bandAreaHeightMeters}m (Fija)
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold">Dimensiones del Salón</h3>

          <div className="space-y-1">
            <div className="text-sm font-medium">Ancho</div>
            <div className="text-2xl font-bold">{hallWidthMeters}m</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Alto</div>
            <div className="text-2xl font-bold">{hallHeightMeters}m</div>
          </div>
        </div>

        <Separator />

        {/* Options */}
        <div className="space-y-3">
          <h3 className="font-semibold">Opciones</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-labels">Mostrar Etiquetas</Label>
            <Switch id="show-labels" checked={showLabels} onCheckedChange={onToggleLabels} />
          </div>

          <Button onClick={onAutoRenumber} className="w-full justify-start bg-transparent" variant="outline">
            <Hash className="mr-2 h-4 w-4" />
            Renumerar Mesas
          </Button>
        </div>

        {/* Selected Table Controls - Added note field and translated all text */}
        {selectedTable && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold">Mesa Seleccionada #{selectedTable.number}</h3>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidad</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="0"
                  max={getMaxCapacity(selectedTable.type)}
                  value={selectedTable.capacity}
                  onChange={(e) => onUpdateCapacity(Number(e.target.value))}
                />
                <div className="text-xs text-muted-foreground">
                  {selectedTable.capacity === 0
                    ? "Mesa decorativa (sin personas)"
                    : `Máximo: ${getMaxCapacity(selectedTable.type)} personas`}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Nota de Mesa</Label>
                <Textarea
                  id="note"
                  placeholder={
                    selectedTable.capacity === 0 ? "Ej: Pastel, Regalos, Dulces..." : "Ej: VIP, Familia, Reservado..."
                  }
                  value={selectedTable.note || ""}
                  onChange={(e) => onUpdateNote(e.target.value)}
                  rows={2}
                  maxLength={25}
                  className="resize-none"
                />
                <div className="text-xs text-muted-foreground">{(selectedTable.note || "").length}/25 caracteres</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={onRotate} variant="outline" size="sm">
                  <RotateCw className="mr-2 h-4 w-4" />
                  Rotar
                </Button>
                <Button onClick={onDuplicate} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </Button>
              </div>

              <Button onClick={onDelete} variant="destructive" className="w-full" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Mesa
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
