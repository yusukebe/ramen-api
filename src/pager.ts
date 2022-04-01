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
    let sliceStart = 0
    let sliceEnd = 0

    if (first === null && last === null) {
      throw new Error(
        'You must provide a `first` or `last` value to properly paginate the connection.'
      )
    }

    if (first !== null && last !== null) {
      throw new Error(
        'Passing both `first` and `last` to paginate the connection is not supported.'
      )
    }

    if (after) {
      const index = this.findIndexFromId(after)
      if (index !== undefined) {
        sliceStart = index + 1
      }
    }

    if (before) {
      const index = this.findIndexFromId(before)
      if (index !== undefined) {
        sliceEnd = index
      }
    }

    if (first) {
      sliceEnd = sliceEnd ? sliceEnd : sliceStart + first
      resultNodes = nodes.slice(sliceStart, sliceEnd)
    }
    if (last) {
      sliceEnd = sliceEnd ? sliceEnd : this.nodes.length
      sliceStart = sliceStart ? sliceStart : sliceEnd - last
      resultNodes = nodes.slice(sliceStart, sliceEnd)
    }

    const hasNextPage = nodes.length > sliceEnd
    const hasPreviousPage = 0 < sliceStart

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
