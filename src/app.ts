import type { Context } from 'hono'
import { getMimeType } from 'hono/utils/mime'
import {
  getShopsData,
  getShopInfo,
  getAuthorInfo,
  getShopImageResponse,
} from './data'

export const BASE_URL = 'http://localhost/'

export type Env = {
  Variables: {
    BASE_URL: string
  }
  Bindings: {
    ASSETS?: Fetcher
    __STATIC_CONTENT?: KVNamespace
    MCP_OBJECT?: DurableObjectNamespace
  }
}

export type Options = {
  c: Context<Env>
}

export type Photo = {
  name: string
  url: string
  width: number
  height: number
  authorId?: string
  author?: Author
}

export type PhotoWithData = Photo & {
  base64: string
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

export type listShopsWithPagerResult = {
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
  params: ParametersWithPager,
  options: Options
): Promise<listShopsWithPagerResult> => {
  let { page = 1, perPage = 10 } = params
  if (perPage > 100) perPage = 100
  const limit = perPage
  const offset = (page - 1) * perPage
  const result = await listShops({ limit, offset }, options)
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
  params: Parameters = {},
  options: Options
): Promise<listShopsResult> => {
  const { limit = 10, offset = 0 } = params
  const data = await getShopsData(options.c.env.ASSETS, options.c.req.url)

  const shopIdsAll = data['shopIds']
  const totalCount = shopIdsAll.length

  const shopIds = shopIdsAll.filter((_id: string, num: number) => {
    if (num >= offset && num < offset + limit) return true
  })

  const shops = await Promise.all(
    shopIds.map(async (id: string) => {
      const shop = await getShop(id, options)
      return shop
    })
  )
  return { shops, totalCount }
}

export const findIndexFromId = async (
  id: string,
  options: Options
): Promise<number> => {
  const list = await listShops({}, options)
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

export const getShop = async (id: string, options: Options): Promise<Shop> => {
  let shop: Shop
  try {
    shop = (await getShopInfo(
      id,
      options.c.env.ASSETS,
      options.c.req.url
    )) as Shop
  } catch {} // Do nothing
  if (!shop) return
  shop.photos?.map((photo: Photo) => {
    photo.url = fixPhotoURL({ shopId: id, path: photo.name }, options)
  })
  return shop
}

export const getAuthor = async (
  id: string,
  options?: Options
): Promise<Author> => {
  let author: Author
  try {
    author = (await getAuthorInfo(
      id,
      options?.c.env?.ASSETS,
      options?.c.req?.url
    )) as Author
  } catch {} // Do nothing
  if (!author) return
  return author
}

const fixPhotoURL = (
  {
    shopId,
    path,
  }: {
    shopId: string
    path: string
  },
  options: Options
): string => {
  if (path.match(/^https?:\/\/.+/)) return path
  return `${options.c.var.BASE_URL}images/${shopId}/${path}`
}

export const getShopPhotosWithData = async (
  shopId: string,
  options: Options
): Promise<PhotoWithData[]> => {
  const shop = await getShop(shopId, options)
  if (!shop || !shop.photos) return []

  const photos: PhotoWithData[] = []

  for (const photo of shop.photos) {
    try {
      const response = await getShopImageResponse(
        shopId,
        photo.name,
        options.c.env.ASSETS,
        options.c.var.BASE_URL
      )
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        const base64 = arrayBufferToBase64(arrayBuffer)
        photos.push({
          ...photo,
          base64,
        })
      }
    } catch {} // Do nothing
  }

  return photos
}

export const arrayBufferToBase64 = (arrayBuffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export const getShopImage = async (
  shopId: string,
  filename: string,
  assets: Fetcher,
  baseUrl: string
): Promise<Response> => {
  const mimeType = getMimeType(filename)
  const response = await getShopImageResponse(shopId, filename, assets, baseUrl)

  if (response.ok) {
    const content = await response.arrayBuffer()
    return new Response(content, {
      headers: {
        'Content-Type': mimeType || 'application/octet-stream',
      },
    })
  }

  return new Response(null, { status: 404 })
}
