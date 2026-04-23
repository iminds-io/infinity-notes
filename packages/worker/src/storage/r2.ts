import {Env} from '../types'

export const r2Key = (env: Pick<Env, 'R2_PREFIX'>, ...segments: string[]): string => {
  const prefix = (env.R2_PREFIX || 'books').replace(/^\/+|\/+$/g, '')
  const cleanSegments = segments
    .flatMap((segment) => segment.split('/'))
    .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)

  return [prefix, ...cleanSegments].join('/')
}

export const listAllKeys = async (bucket: R2Bucket, prefix: string): Promise<string[]> => {
  const keys: string[] = []
  let cursor: string | undefined

  do {
    const result = await bucket.list({prefix, cursor})
    keys.push(...result.objects.map((object) => object.key))
    cursor = result.truncated ? result.cursor : undefined
  } while (cursor)

  return keys
}

export const readText = async (bucket: R2Bucket, key: string): Promise<string | null> => {
  const object = await bucket.get(key)
  return object ? await object.text() : null
}

export const readJson = async <T>(bucket: R2Bucket, key: string): Promise<T | null> => {
  const text = await readText(bucket, key)
  return text ? (JSON.parse(text) as T) : null
}

export const writeJson = async (
  bucket: R2Bucket,
  key: string,
  value: unknown,
): Promise<void> => {
  await bucket.put(key, JSON.stringify(value))
}
