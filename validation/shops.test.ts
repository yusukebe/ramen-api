import type { Context } from 'hono'
import type { Env } from '@/app'
import { getAuthor, listShopsWithPager } from '@/app'

const BASE_URL = 'https://ramen-api.dev/'
const options = {
  c: {
    env: {},
    var: {
      BASE_URL,
    },
  } as Context<Env>,
}

describe('Validate shops', () => {
  it('Should return all shops correctly', async () => {
    let page = 1
    let result = await listShopsWithPager({ page, perPage: 10 }, options)
    expect(result.totalCount).not.toBeFalsy()
    while (result.pageInfo.nextPage) {
      expect(result.shops).not.toBeFalsy()
      result.shops.map((shop) => {
        expect(shop.id).toMatch(/^[0-9a-z\-]+$/)
        expect(shop.name).not.toBeFalsy()
        shop.photos.map(async (photo) => {
          expect(photo.name).toMatch(/^[0-9a-z\-\.]+\.(jpg|jpeg|png|gif)$/)
          expect(photo.url).toMatch(
            /^https:\/\/ramen-api.dev\/.+\.(jpg|jpeg|png|gif)$/
          )
          expect(typeof photo.height).toBe('number')
          expect(typeof photo.width).toBe('number')
          expect(photo.authorId).toMatch(/^[0-9a-zA-Z\-\_]+$/)
          const author = await getAuthor(photo.authorId)
          expect(author).not.toBeNull()
          expect(author.name).not.toBeNull()
          expect(author.url).toMatch(/^https:\/\/.+$/)
        })
      })
      page++
      result = await listShopsWithPager({ page, perPage: 10 }, options)
    }
  })
})
