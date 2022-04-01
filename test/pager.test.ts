import { Pager } from '@/pager'

type Node = {
  id: string
}

describe('Pager - findIndexFromId', () => {
  const nodes: Node[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }]
  const pager = new Pager({ nodes })
  it('findIndexFromId("b")', () => {
    const index = pager.findIndexFromId('b')
    expect(index).toBe(1)
  })

  it('findIndexFromId("f")', () => {
    const index = pager.findIndexFromId('f')
    expect(index).toBe(undefined)
  })
})

describe('Pager - first/after', () => {
  const nodes: Node[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }]
  const pager = new Pager({ nodes })

  it('first: 3', () => {
    const pagingResult = pager.paging({ first: 3, after: null, last: null, before: null })
    expect(pagingResult.startId).toBe('a')
    expect(pagingResult.endId).toBe('c')
    expect(pagingResult.hasNextPage).toBe(true)
    expect(pagingResult.hasPreviousPage).toBe(false)
  })

  it('first: 3, after: b', () => {
    const pagingResult = pager.paging({ first: 3, after: 'b', last: null, before: null })
    expect(pagingResult.startId).toBe('c')
    expect(pagingResult.endId).toBe('e')
    expect(pagingResult.hasNextPage).toBe(false)
    expect(pagingResult.hasPreviousPage).toBe(true)
  })

  it('first: 3, after: c', () => {
    const pagingResult = pager.paging({ first: 3, after: 'c', last: null, before: null })
    expect(pagingResult.startId).toBe('d')
    expect(pagingResult.endId).toBe('e')
    expect(pagingResult.hasNextPage).toBe(false)
    expect(pagingResult.hasPreviousPage).toBe(true)
  })
})

describe('Pager - last/before', () => {
  const nodes: Node[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }]
  const pager = new Pager({ nodes })

  it('last: 3', () => {
    const pagingResult = pager.paging({ first: null, after: null, last: 3, before: null })
    expect(pagingResult.startId).toBe('e')
    expect(pagingResult.endId).toBe('c')
    expect(pagingResult.hasNextPage).toBe(true)
    expect(pagingResult.hasPreviousPage).toBe(false)
  })

  it('last: 3, before: e', () => {
    const pagingResult = pager.paging({ first: null, after: null, last: 3, before: 'e' })
    expect(pagingResult.startId).toBe('d')
    expect(pagingResult.endId).toBe('b')
    expect(pagingResult.hasNextPage).toBe(true)
    expect(pagingResult.hasPreviousPage).toBe(true)
  })

  it('last: 3, before: d', () => {
    const pagingResult = pager.paging({ first: null, after: null, last: 3, before: 'd' })
    expect(pagingResult.startId).toBe('c')
    expect(pagingResult.endId).toBe('a')
    expect(pagingResult.hasNextPage).toBe(false)
    expect(pagingResult.hasPreviousPage).toBe(true)
  })
})
