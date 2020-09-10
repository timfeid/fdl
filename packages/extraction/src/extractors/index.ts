import path from 'path'
import glob from 'glob'
import { Validator, Extractor } from "./extractor";
import { DownloadInfo } from '@fdl/server';
import Download from '../../../downloader/src';

type DriverMatcher = {
  matches: Validator
  driver: new (info: DownloadInfo) => Extractor
}
const drivers: DriverMatcher[] = []
const driverGlob = path.join(__dirname, '**', '*.extractor.ts')
const matches = glob.sync(driverGlob)
for (const match of matches) {
  const contents = require(match)
  const driver = contents.default
  const validator = contents.validator

  if (driver.prototype instanceof Extractor && typeof validator === 'function') {
    drivers.push({
      matches: validator,
      driver,
    })
  }
}

export function findExtractor (downloadInfo: DownloadInfo, downloads: Download[]): Extractor {
  const driverMatcher = drivers.find(driver => driver.matches(downloads))
  const driverClass = driverMatcher ? driverMatcher.driver : undefined

  if (driverClass === undefined) {
    throw Error(`Unable to find extractor for ${downloadInfo.title} ${JSON.stringify(downloadInfo.urls)}`)
  }

  return new driverClass(downloadInfo)
}
