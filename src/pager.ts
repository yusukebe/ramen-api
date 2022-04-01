type PagingResult = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startId: string
  endId: string
  nodes: Node[]
}

type Node = {
  id: string
}

export class Pager {
  nodes: Node[]

  constructor({ nodes }) {
    this.nodes = nodes
  }

  findIndexFromId(id: string): number {
    let index = 0
    const matches = this.nodes.filter((node, i) => {
      if (node && node.id === id) {
        index = i
        return true
      }
    })
    if (matches.length > 0) return index
  }

  paging({
    first = null,
    after = null,
    last = null,
    before = null,
  }: {
    first: number
    after: string
    last: number
    before: string
  }): PagingResult {
    const nodes = this.nodes

    let resultNodes: Node[]
    let hasNextPage: boolean
    let hasPreviousPage: boolean

    if (last !== null) {
      // * <--- *
      let sliceEnd = this.nodes.length
      if (before) {
        const index = this.findIndexFromId(before)
        if (index !== undefined) sliceEnd = index
      }
      const sliceStart = sliceEnd - last
      resultNodes = nodes.slice(sliceStart, sliceEnd).reverse()
      hasNextPage = 0 < sliceStart
      hasPreviousPage = nodes.length > sliceEnd
    } else {
      // * ---> *
      let sliceStart = 0
      if (after !== null) {
        const index = this.findIndexFromId(after)
        if (index !== undefined) {
          sliceStart = index + 1
        }
      }
      const sliceEnd = sliceStart + first
      resultNodes = nodes.slice(sliceStart, sliceEnd)
      hasNextPage = nodes.length > sliceStart + first
      hasPreviousPage = 0 < sliceStart
    }

    const startId = resultNodes.length > 0 ? resultNodes[0].id : null
    const endId = resultNodes.length > 0 ? resultNodes[resultNodes.length - 1].id : null

    return {
      nodes: resultNodes,
      startId,
      endId,
      hasNextPage,
      hasPreviousPage,
    }
  }
}
