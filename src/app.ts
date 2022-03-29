import { getContentFromKVAsset } from 'hono/utils/cloudflare'

declare const ENV_BASE_URL: string
export const BASE_URL = ENV_BASE_URL ?? 'http://localhost:8787/'

type Parameters = {
  page?: number
  perPage?: number
}

type Photo = {
  name: string
}

type Shop = {
  id: string
  name?: string
  photos?: Photo[]
}

type listShopsResult = {
  shops: Shop[]
  totalCount: number
}

export const listShops = async (params: Parameters = {}): Promise<listShopsResult> => {
  const { page = 1, perPage = 10 } = params
  //const data = await getJSONFromKVAsset<{ [key: string]: string[] }>('shops.json')
  const buffer = await getContentFromKVAsset('shops.json')
  const data = arrayBufferToJSON(buffer)

  const shopIdsAll = data['shopIds']
  const totalCount = shopIdsAll.length

  const shopIds = shopIdsAll.filter((_id: string, num: number) => {
    if (num >= (page - 1) * perPage && num < page * perPage) return true
  })

  const shops = await Promise.all(
    shopIds.map(async (id: string) => {
      const shop = await getShop(id)
      return shop
    })
  )
  return { shops, totalCount }
}

export const getShop = async (id: string): Promise<Shop> => {
  const buffer = await getContentFromKVAsset(`shops/${id}/info.json`)
  const shop = arrayBufferToJSON(buffer)
  shop.photos?.map((photo) => {
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
  return JSON.parse(new TextDecoder().decode(arrayBuffer))
}
