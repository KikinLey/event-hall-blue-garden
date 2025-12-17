export type TableType = "head" | "square" | "rectangular"

export interface Table {
  id: string
  type: TableType
  x: number
  y: number
  rotation: number
  capacity: number
  number: number
  note?: string
}

export interface Column {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface DanceFloor {
  x: number
  y: number
  width: number
  height: number
  locked: boolean
}

export interface BandArea {
  x: number
  y: number
  width: number
  height: number
  locked: boolean
}

export interface Layout {
  tables: Table[]
  hallWidth: number
  hallHeight: number
  columns?: Column[]
  danceFloor?: DanceFloor
  bandArea?: BandArea
  showColumns?: boolean
  showDanceFloor?: boolean
  showBandArea?: boolean
}
