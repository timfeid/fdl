import si from 'systeminformation'

export type DownloadObject = {
  finalUrl: string
  started: boolean
  contentLength: number
  downloaded: number
  totalProgress: number
  originalUrl: string
  driver: Record<string, any>,
}

export enum Step {
  QUEUE = 'queue',
  DOWNLOAD = 'download',
  EXTRACT = 'extract',
  COMPLETE = 'complete',
}

export interface Url {
  url: string
  contentLength?: number | null
}

export interface Episode {
  airDate?: string
  number: number
  blurb?: string
  name: string
}

export interface Type {
  name: string
}

export interface Extraction {
  progress: number
  files?: string[]
  started: boolean
}

export interface InfoResponse {
  year: string
  title: string
  blurb: string
  poster: string
  season?: number
  episode?: number
  type: Type
}

export interface IncomingDownload extends InfoResponse {
  referrer?: string
  urls: string[]
}

export interface DownloadInfo extends InfoResponse {
  id: number
  urls: Url[]
  step: Step
  referrer?: string
}

export interface DownloadBundle extends DownloadInfo {
  downloads: DownloadObject[]
  extraction: Extraction
  downloadProgress: number
  startedAt?: Date | null
  completedAt?: Date | null
}

export interface DiskInfo {
  filesystem: string
  size: string
  used: string
  available: string
  capacity: number
  mount: string
}

export interface SystemInformation {
  downloadDisk: DiskInfo,
  nasDisk: DiskInfo,
  cpu: si.Systeminformation.CpuData,
  time: si.Systeminformation.TimeData,
  os: si.Systeminformation.OsData,
  currentLoad: si.Systeminformation.CurrentLoadData,
  mem: si.Systeminformation.MemData,
  network: si.Systeminformation.NetworkStatsData[],
  temp: si.Systeminformation.CpuTemperatureData,
}

export type SearchResult = {
  originalName: string
  name: string
  popularity: number
  firstAirDate: string
  id: number
  posterPath: string
  backdropPath: string
  blurb: string
  type: 'movie' | 'series'
}
