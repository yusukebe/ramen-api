import { getShop, listShops } from '@/app'

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
    expect(result.shops[1].id).toBe('sugitaya')
    expect(result.shops[2].id).toBe('takasagoya')
  })

  it('Return objects with perPage option', async () => {
    const result = await listShops({ perPage: 1 })
    expect(result.totalCount).toBe(3)
    expect(result.shops[0].id).toBe('yoshimuraya')
    expect(result.shops[1]).toBeUndefined()
  })

  it('Return objects with page option', async () => {
    const result = await listShops({ perPage: 1, page: 2 })
    expect(result.totalCount).toBe(3)
    expect(result.shops[0].id).toBe('sugitaya')
    expect(result.shops[1]).toBeUndefined()
  })
})
