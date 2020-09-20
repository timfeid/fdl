export type DownloadObject = {
  finalUrl: string
  started: boolean
  contentLength: number
  downloaded: number
  totalProgress: number
}

export enum Step {
  QUEUE = 'queue',
  DOWNLOAD = 'download',
  EXTRACT = 'extract',
  COMPLETE = 'complete',
}

export interface Url {
  url: string
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

export interface DownloadInfo extends InfoResponse {
  id: number
  urls: Url[]
  step: Step
}

export interface DownloadBundle extends DownloadInfo {
  downloads: DownloadObject[]
  extraction: Extraction
  downloadProgress: number
}
