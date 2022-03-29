declare const __STATIC_CONTENT: KVNamespace, __STATIC_CONTENT_MANIFEST: string

const getManifest = (): Record<string, string> => {
  let ASSET_MANIFEST: Record<string, string>
  if (typeof __STATIC_CONTENT_MANIFEST === 'string') {
    ASSET_MANIFEST = JSON.parse(__STATIC_CONTENT_MANIFEST)
  } else {
    ASSET_MANIFEST = __STATIC_CONTENT_MANIFEST
  }
  return ASSET_MANIFEST
}

export const getJSONFromKVAsset = async <T>(path: string): Promise<T> => {
  const ASSET_NAMESPACE = __STATIC_CONTENT

  const manifest = getManifest()
  const key = manifest[path] ?? path
  const content: T = await ASSET_NAMESPACE.get(key, { type: 'json' })

  return content
}
