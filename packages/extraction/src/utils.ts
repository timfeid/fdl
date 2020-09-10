import fs from 'fs'

export function copyOrRename (from: string, to: string) {
  try {
    fs.renameSync(from, to)
  } catch (e) {
    if (e.code === 'EXDEV') {
      fs.copyFileSync(from, to)
      fs.unlinkSync(from)
    }
  }
}
