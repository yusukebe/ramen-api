import { SELF, env } from 'cloudflare:test'
import type { Author, listShopsWithPagerResult } from '@/app'
import { getShopsData } from '@/data'

const BASE_URL = 'https://ramen-api.dev'

describe('Validate shops.json', async () => {
  const { shopIds } = (await getShopsData(env.ASSETS, BASE_URL)) as {
    shopIds: string[]
  }

  it('Should not contain duplicate shop ids', () => {
    const duplicates = shopIds.filter((id, i) => shopIds.indexOf(id) !== i)
    expect(duplicates, 'duplicate ids in content/shops.json').toEqual([])
  })

  it('Should have info.json for every shop id', async () => {
    for (const id of shopIds) {
      const res = await SELF.fetch(`${BASE_URL}/shops/${id}`)
      expect(res.status, `content/shops/${id}/info.json is not found`).toBe(200)
    }
  })
})

describe('Validate shops with SELF and REST API', () => {
  it('Should validate all shops via REST API', async () => {
    // Get shops via REST API
    let page = 1
    let hasNextPage: boolean | number = true

    while (hasNextPage) {
      const shopsResponse = await SELF.fetch(
        `${BASE_URL}/shops?page=${page}&perPage=10`
      )
      expect(shopsResponse.status).toBe(200)

      const shopsData = await shopsResponse.json<listShopsWithPagerResult>()
      expect(shopsData.totalCount).not.toBeFalsy()
      expect(shopsData.shops).toBeDefined()
      expect(Array.isArray(shopsData.shops)).toBe(true)

      // Validate each shop
      for (const shop of shopsData.shops) {
        expect(shop.id).toMatch(/^[0-9a-z-]+$/)
        expect(shop.name).not.toBeFalsy()
        expect(Array.isArray(shop.photos)).toBe(true)

        // prefecture is optional, but when present it must be a 都道府県 name
        if (shop.prefecture !== undefined) {
          expect(shop.prefecture).toMatch(/^.+[都道府県]$/)
        }

        // location is optional, but when present it must contain valid coordinates
        if (shop.location !== undefined) {
          expect(typeof shop.location.lat).toBe('number')
          expect(typeof shop.location.lng).toBe('number')
          expect(shop.location.lat).toBeGreaterThanOrEqual(-90)
          expect(shop.location.lat).toBeLessThanOrEqual(90)
          expect(shop.location.lng).toBeGreaterThanOrEqual(-180)
          expect(shop.location.lng).toBeLessThanOrEqual(180)
        }

        // Validate each photo
        for (const photo of shop.photos) {
          expect(photo.name).toMatch(/^[0-9a-z.-]+\.(jpg|jpeg|png|gif)$/)
          expect(photo.url).toMatch(
            /^https:\/\/ramen-api.dev\/.+\.(jpg|jpeg|png|gif)$/
          )
          expect(typeof photo.height).toBe('number')
          expect(typeof photo.width).toBe('number')
          expect(photo.authorId).toMatch(/^[0-9a-zA-Z_-]+$/)

          // Validate the photo file exists
          const photoResponse = await SELF.fetch(photo.url)
          expect(
            photoResponse.status,
            `content/shops/${shop.id}/${photo.name} is not found`
          ).toBe(200)
          expect(photoResponse.headers.get('Content-Type')).toMatch(/^image\//)
          await photoResponse.arrayBuffer()

          // Validate author via REST API
          const authorResponse = await SELF.fetch(
            `${BASE_URL}/authors/${photo.authorId}`
          )
          expect(authorResponse.status).toBe(200)

          const authorData = await authorResponse.json<{ author: Author }>()
          expect(authorData.author).not.toBeNull()
          expect(authorData.author.id).toBe(photo.authorId)
          expect(authorData.author.name).not.toBeFalsy()
          expect(authorData.author.url).toMatch(/^https:\/\/.+$/)
        }
      }

      hasNextPage = shopsData.pageInfo?.nextPage || false
      page++
    }
  })
})
