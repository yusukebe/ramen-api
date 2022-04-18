import { getContentFromKVAsset } from 'hono/utils/cloudflare'

declare const ENV_BASE_URL: string
export const BASE_URL = ENV_BASE_URL ?? 'http://localhost:8787/'

export type Photo = {
  name: string
  url: string
  width: number
  height: number
  authorId?: string
  author?: Author
}

export type Shop = {
  id: string
  name?: string
  photos?: Photo[]
}

export type Author = {
  id: string
  name: string
  url: string
}

type Parameters = {
  limit?: number
  offset?: number
}

type listShopsResult = {
  shops: Shop[]
  totalCount: number
}

type listShopsWithPagerResult = {
  shops: Shop[]
  totalCount: number
  pageInfo: pageInfo
}

type pageInfo = {
  nextPage: number | null
  prevPage: number | null
  lastPage: number
  currentPage: number
  perPage: number
}

type ParametersWithPager = {
  page: number
  perPage: number
}

export const listShopsWithPager = async (
  params: ParametersWithPager
): Promise<listShopsWithPagerResult> => {
  let { page = 1, perPage = 10 } = params
  if (perPage > 100) perPage = 100
  const limit = perPage
  const offset = (page - 1) * perPage
  const result = await listShops({ limit, offset })
  const totalCount = result.totalCount
  const lastPage =
    totalCount % perPage == 0
      ? totalCount / perPage
      : Math.floor(totalCount / perPage) + 1
  const nextPage = lastPage > page ? page + 1 : null
  const prevPage = page > 1 ? page - 1 : null

  return {
    shops: result.shops,
    totalCount,
    pageInfo: {
      nextPage,
      prevPage,
      lastPage,
      perPage,
      currentPage: page,
    },
  }
}

export const listShops = async (
  params: Parameters = {}
): Promise<listShopsResult> => {
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
  } catch (e) {
    throw new Error(`"shops/${id}/info.json" is not found: ${e}`)
  }
  if (!shop) return
  shop.photos?.map((photo: Photo) => {
    photo.url = fixPhotoURL({ shopId: id, path: photo.name })
  })
  return shop
}

export const getAuthor = async (id: string): Promise<Author> => {
  let author: Author
  try {
    const buffer = await getContentFromKVAsset(`authors/${id}/info.json`)
    author = arrayBufferToJSON(buffer)
  } catch (e) {
    throw new Error(`"authors/${id}/info.json" is not found: ${e}`)
  }
  if (!author) return
  return author
}

const fixPhotoURL = ({
  shopId,
  path,
}: {
  shopId: string
  path: string
}): string => {
  if (path.match(/^https?:\/\/.+/)) return path
  return `${BASE_URL}images/${shopId}/${path}`
}

const arrayBufferToJSON = (arrayBuffer: ArrayBuffer) => {
  const text = new TextDecoder().decode(arrayBuffer)
  if (text) return JSON.parse(text)
}
