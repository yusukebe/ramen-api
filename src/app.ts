import type { KVNamespace } from '@cloudflare/workers-types'
import type { Context } from 'hono'
import { getContentFromKVAsset } from './workers-utils'

export const BASE_URL = 'http://localhost/'

export type Env = {
  Variables: {
    BASE_URL: string
  }
  Bindings: {
    __STATIC_CONTENT: KVNamespace
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
  const c = options.c
  const buffer = await getContentFromKVAsset('shops.json', {
    namespace: c.env ? c.env.__STATIC_CONTENT : undefined,
  })
  const data = arrayBufferToJSON(buffer)

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
    const c = options.c
    const buffer = await getContentFromKVAsset(`shops/${id}/info.json`, {
      namespace: c.env ? c.env.__STATIC_CONTENT : undefined,
    })
    shop = arrayBufferToJSON(buffer)
  } catch (e) {
    throw new Error(`"shops/${id}/info.json" is not found: ${e}`)
  }
  if (!shop) return
  shop.photos?.map((photo: Photo) => {
    photo.url = fixPhotoURL({ shopId: id, path: photo.name }, options)
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

const arrayBufferToJSON = (arrayBuffer: ArrayBuffer) => {
  if (arrayBuffer instanceof ArrayBuffer) {
    const text = new TextDecoder().decode(arrayBuffer)
    if (text) return JSON.parse(text)
  } else {
    return arrayBuffer
  }
}

export const getShopPhotosWithData = async (
  shopId: string,
  options: Options
): Promise<PhotoWithData[]> => {
  const shop = await getShop(shopId, options)

  const photos = await Promise.all(
    shop.photos?.map(async (photo): Promise<PhotoWithData | null> => {
      try {
        const buffer = await getContentFromKVAsset(
          `shops/${shopId}/${photo.name}`,
          {
            namespace: options.c.env
              ? options.c.env.__STATIC_CONTENT
              : undefined,
          }
        )
        const base64 = arrayBufferToBase64(buffer)
        return {
          ...photo,
          base64,
        }
      } catch (e) {
        console.error(`Failed to load image ${photo.name}:`, e)
        return null
      }
    }) || []
  )

  return photos.filter(Boolean)
}

export const arrayBufferToBase64 = (arrayBuffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
