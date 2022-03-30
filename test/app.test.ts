import { getShop, listShops, findIndexFromId } from '@/app'
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
