import { getContentFromKVAsset } from 'hono/utils/cloudflare'

declare const ENV_BASE_URL: string
export const BASE_URL = ENV_BASE_URL ?? 'http://localhost:8787/'

export type Photo = {
  name: string
}

export type Shop = {
  id: string
  name?: string
  photos?: Photo[]
}

type Parameters = {
  limit?: number
  offset?: number
}

type listShopsResult = {
  shops: Shop[]
  totalCount: number
}

export const listShops = async (params: Parameters = {}): Promise<listShopsResult> => {
  const { limit = 10, offset = 0 } = params
  const buffer = await getContentFromKVAsset('shops.json')
  const data = arrayBufferToJSON(buffer)

  const shopIdsAll = data['shopIds']
  const totalCount = shopIdsAll.length

  const shopIds = shopIdsAll.filter((_id: string, num: number) => {
    if (num >= offset && num < offset + limit) return true
  })

  const shops = await Promise.all(
    shopIds.map(async (id: string) => {
      const shop = await getShop(id)
      return shop
    })
  )
  return { shops, totalCount }
}

export const findIndexFromId = async (id: string): Promise<number> => {
  const list = await listShops()
  const shops = list.shops
  let index = 0
  const matchShop = shops.filter((shop, i) => {
    if (shop && shop.id === id) {
      index = i
      return true
    }
  })
  if (matchShop.length > 0) return index
}

export const getShop = async (id: string): Promise<Shop> => {
  let shop: Shop
  try {
    const buffer = await getContentFromKVAsset(`shops/${id}/info.json`)
    shop = arrayBufferToJSON(buffer)
  } catch {
    // Do nothing
  }
  if (!shop) return
  shop.photos?.map((photo: Photo) => {
    photo.name = fixPhotoURL(id, photo.name)
  })
  return shop
}

const fixPhotoURL = (shopId: string, path: string): string => {
  if (path.match(/^https?:\/\/.+/)) return path
  return `${BASE_URL}images/${shopId}/${path}`
}

export const getImage = (path: string) => {}

const arrayBufferToJSON = (arrayBuffer: ArrayBuffer) => {
  const text = new TextDecoder().decode(arrayBuffer)
  if (text) return JSON.parse(text)
}
