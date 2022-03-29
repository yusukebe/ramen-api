import { getJSONFromKVAsset } from '@/kv'

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
  const data = await getJSONFromKVAsset<{ [key: string]: string[] }>('shops.json')
  const shopIdsAll = data['shopIds']
  const totalCount = shopIdsAll.length

  const shopIds = shopIdsAll.filter((shop, num) => {
    if (num >= (page - 1) * perPage && num < page * perPage) return true
  })

  const shops = await Promise.all(
    shopIds.map(async (id) => {
      const shop = await getShop(id)
      return shop
    })
  )
  return { shops, totalCount }
}

export const getShop = async (id: string): Promise<Shop> => {
  const shop = await getJSONFromKVAsset<Shop>(`shops/${id}/info.json`)
  return shop
}

export const getImage = (path: string) => {}
