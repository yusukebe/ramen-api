import { encodeBase64, decodeBase64 } from 'hono/utils/crypto'
import { getShop, listShops, findIndexFromId } from '@/app'

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt,
} from 'graphql'

const photoType = new GraphQLObjectType({
  name: 'Photo',
  fields: {
    name: { type: GraphQLString },
  },
})

const shopType = new GraphQLObjectType({
  name: 'Shop',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    photos: {
      type: new GraphQLList(photoType),
    },
  },
})

const edgeType = new GraphQLObjectType({
  name: 'Edge',
  fields: {
    node: { type: shopType },
    cursor: { type: GraphQLString },
  },
})

const pageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    hasNextPage: { type: GraphQLBoolean },
    hasPreviousPage: { type: GraphQLBoolean },
    startCursor: { type: GraphQLString },
    endCursor: { type: GraphQLString },
  },
})

const connectionType = new GraphQLObjectType({
  name: 'Connection',
  fields: {
    totalCount: { type: GraphQLInt },
    edges: { type: new GraphQLList(edgeType) },
    pageInfo: { type: pageInfoType },
  },
})

// Pagination algorithm
// https://relay.dev/graphql/connections.htm#sec-Pagination-algorithm

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    shops: {
      type: connectionType,
      args: {
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
        last: { type: GraphQLInt },
        before: { type: GraphQLString },
      },
      resolve: async (
        _,
        {
          first = 10,
          after,
          last,
          before,
        }: { first: number; after: string; last: number; before: string }
      ) => {
        const result = await listShops()
        const allShops = result.shops

        let sliceStart: number
        let sliceEnd: number

        if (after) {
          const id = convertCursorToId(after)
          const matchingIndex = await findIndexFromId(id)
          if (matchingIndex !== undefined) {
            sliceStart = matchingIndex + 1
            sliceEnd = sliceStart + first
          }
        } else if (before) {
          const id = convertCursorToId(before)
          const matchingIndex = await findIndexFromId(id)
          if (matchingIndex !== undefined) {
            sliceStart = matchingIndex - last + 1
            sliceEnd = matchingIndex
          }
        } else {
          sliceStart = 0
          sliceEnd = first
        }

        const edges = allShops.slice(sliceStart, sliceEnd).map((node) => {
          return {
            node,
            cursor: convertIdToCursor(node.id),
          }
        })

        const startCursor = edges.length > 0 ? convertIdToCursor(edges[0].node.id) : null
        const endCursor =
          edges.length > 0 ? convertIdToCursor(edges[edges.length - 1].node.id) : null
        const hasNextPage = allShops.length > sliceStart + first
        const hasPreviousPage = 0 < sliceStart

        return {
          totalCount: result.totalCount,
          edges,
          pageInfo: {
            startCursor,
            endCursor,
            hasNextPage,
            hasPreviousPage,
          },
        }
      },
    },
    shop: {
      type: shopType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: async (_, { id }) => {
        return await getShop(id)
      },
    },
  },
})

export const convertIdToCursor = (id: string): string => {
  return encodeBase64(id)
}

export const convertCursorToId = (cursor: string): string => {
  return decodeBase64(cursor)
}

export const schema = new GraphQLSchema({ query: queryType })
