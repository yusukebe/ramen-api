const CONTENT_PREFIX =
  process.env && process.env.NODE_ENV === 'test' ? '/content' : ''

export const getShopsData = async (assets: Fetcher, baseUrl: string) => {
  const response = await assets.fetch(
    new URL(`${CONTENT_PREFIX}/shops.json`, baseUrl)
  )
  return await response.json()
}

export const getShopInfo = async (
  shopId: string,
  assets: Fetcher,
  baseUrl: string
) => {
  const response = await assets.fetch(
    new URL(`${CONTENT_PREFIX}/shops/${shopId}/info.json`, baseUrl)
  )
  return await response.json()
}

export const getAuthorInfo = async (
  authorId: string,
  assets: Fetcher,
  baseUrl: string
) => {
  const response = await assets.fetch(
    new URL(`${CONTENT_PREFIX}/authors/${authorId}/info.json`, baseUrl)
  )
  return await response.json()
}

export const getShopImageResponse = async (
  shopId: string,
  filename: string,
  assets: Fetcher,
  baseUrl: string
) => {
  const path = `${CONTENT_PREFIX}/shops/${shopId}/${filename}`
  return await assets.fetch(new URL(path, baseUrl))
}
