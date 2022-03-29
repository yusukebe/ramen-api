import { app } from '@/index'

const yoshimurayaData = {
  id: 'yoshimuraya',
  name: '吉村家',
  photos: [
    {
      name: 'yoshimuraya-001.jpg',
    },
  ],
}

describe('Test /', () => {
  it('Should return 200 response', async () => {
    const res = await app.request('http://localhost/')
    expect(res.status).toBe(200)
  })
})

describe('Test /shops', () => {
  it('Should return shops with GET /shops', async () => {
    const res = await app.request('http://localhost/shops')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data['total_count']).toBe(3)
    expect(data['shops'][0]).toEqual(yoshimurayaData)
    expect(data['shops'][1]['id']).toBe('sugitaya')
    expect(data['shops'][2]['id']).toBe('takasagoya')
  })

  it('Should return shops with GET /shops?page=1&per_page=1', async () => {
    const res = await app.request('http://localhost/shops?page=1&per_page=1')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data['total_count']).toBe(3)
    expect(data['shops'][0]).not.toBeUndefined()
    expect(data['shops'][1]).toBeUndefined()
  })

  it('Should return shop with GET /shops/1', async () => {
    const res = await app.request('http://localhost/shops/yoshimuraya')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data['shop']).toEqual(yoshimurayaData)
  })
})
