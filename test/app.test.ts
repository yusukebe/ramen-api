import { getShop, listShops, findIndexFromId, getAuthor, BASE_URL, listShopsWithPager } from '@/app'
import { assign } from '@/mock'

assign()

describe('getShop', () => {
  it('Should return Shop object', async () => {
    const shop = getShop('yoshimuraya')
    expect(shop).not.toBeFalsy()
  })
})

describe('listShops', () => {
  it('Should return listShopsResult objects', async () => {
    const result = await listShops()
    expect(result.totalCount).toBe(3)
    expect(result.shops).not.toBeFalsy()
    expect(result.shops[0].id).toBe('yoshimuraya')
    expect(result.shops[0]['photos'][0]).toEqual({
      name: 'yoshimuraya-001.jpg',
      url: `${BASE_URL}images/yoshimuraya/yoshimuraya-001.jpg`,
      authorId: 'yusukebe',
      width: 1200,
      height: 900,
    })
    expect(result.shops[1].id).toBe('sugitaya')
    expect(result.shops[2].id).toBe('takasagoya')
  })

  it('Return objects with limit option', async () => {
    const result = await listShops({ limit: 1 })
    expect(result.totalCount).toBe(3)
    expect(result.shops[0].id).toBe('yoshimuraya')
    expect(result.shops[1]).toBeUndefined()
  })

  it('Return objects with limit and offset options', async () => {
    const result = await listShops({ limit: 1, offset: 1 })
    expect(result.totalCount).toBe(3)
    expect(result.shops[0].id).toBe('sugitaya')
    expect(result.shops[1]).toBeUndefined()
  })
})

describe('listShopsWithPager', () => {
  it('Return objects with pagination - perPage:1, page: 1', async () => {
    const result = await listShopsWithPager({ perPage: 1, page: 1 })
    expect(result.totalCount).toBe(3)
    expect(result.shops[0]).not.toBeUndefined()
    expect(result.shops[1]).toBeUndefined()
    expect(result.pageInfo.currentPage).toBe(1)
    expect(result.pageInfo.perPage).toBe(1)
    expect(result.pageInfo.nextPage).toBe(2)
    expect(result.pageInfo.prevPage).toBe(null)
    expect(result.pageInfo.lastPage).toBe(3)
  })

  it('Return objects with pagination - perPage: 2, page: 2', async () => {
    const result = await listShopsWithPager({ perPage: 2, page: 2 })
    expect(result.totalCount).toBe(3)
    expect(result.shops[0]).not.toBeUndefined()
    expect(result.shops[1]).toBeUndefined()
    expect(result.pageInfo.currentPage).toBe(2)
    expect(result.pageInfo.perPage).toBe(2)
    expect(result.pageInfo.nextPage).toBe(null)
    expect(result.pageInfo.prevPage).toBe(1)
    expect(result.pageInfo.lastPage).toBe(2)
  })
})

describe('findIndexFromId', () => {
  it('Should return index', async () => {
    let index = await findIndexFromId('yoshimuraya')
    expect(index).toBe(0)
    index = await findIndexFromId('sugitaya')
    expect(index).toBe(1)
    index = await findIndexFromId('abcde')
    expect(index).toBeUndefined()
  })
})

describe('getAuthor', () => {
  it('Should return author', async () => {
    const author = await getAuthor('yusukebe')
    expect(author).not.toBeFalsy()
    expect(author.id).toBe('yusukebe')
    expect(author.name).toBe('Yusuke Wada')
    expect(author.url).toBe('https://github.com/yusukebe')
  })
})
