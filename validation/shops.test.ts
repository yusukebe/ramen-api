import { SELF } from 'cloudflare:test'
import type { Author, listShopsWithPagerResult } from '@/app'

const BASE_URL = 'https://ramen-api.dev'

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
        expect(shop.id).toMatch(/^[0-9a-z\-]+$/)
        expect(shop.name).not.toBeFalsy()
        expect(Array.isArray(shop.photos)).toBe(true)

        // Validate each photo
        for (const photo of shop.photos) {
          expect(photo.name).toMatch(/^[0-9a-z\-\.]+\.(jpg|jpeg|png|gif)$/)
          expect(photo.url).toMatch(
            /^https:\/\/ramen-api.dev\/.+\.(jpg|jpeg|png|gif)$/
          )
          expect(typeof photo.height).toBe('number')
          expect(typeof photo.width).toBe('number')
          expect(photo.authorId).toMatch(/^[0-9a-zA-Z\-\_]+$/)

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
