import {Option as OptionModel} from '@fdl/data'

interface Option<T> {
  save (value: T): string
  retrieve (value: string): T
  default: T
}

const saveJson = (value: boolean | string | number): string => {
  return JSON.stringify(value)
}

function retrieveJson<T> (value: string): T {
  return JSON.parse(value) as T
}

const deleteAfterDownload: Option<boolean> = {
  save: saveJson,
  retrieve: retrieveJson,
  default: true,
}

const maxDownloads: Option<number> = {
  save: saveJson,
  retrieve: retrieveJson,
  default: 8,
}

const options: Record<string, Option<any>> = {
  deleteAfterDownload,
  maxDownloads,
}

export async function getOption (optionString: string) {
  const option = options[optionString]
  if (!option) {
    throw new Error('Unable to find option' + optionString)
  }

  const fromDatabase = await OptionModel.findOne({name: optionString})
  if (fromDatabase) {
    return option.retrieve(fromDatabase.value)
  }

  return option.default
}

export async function saveOption<T> (optionString: string, value: T) {
  const option = options[optionString]
  if (!option) {
    throw new Error('Unable to find option' + optionString)
  }

  const stringValue = option.save(value)
  const fromDatabase = await OptionModel.findOne({name: optionString})
  if (fromDatabase) {
    fromDatabase.value = stringValue
    return await fromDatabase.save()
  }

  return await OptionModel.create({name: optionString, value: stringValue}).save()
}
