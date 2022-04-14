import { encodeBase64, decodeBase64 } from 'hono/utils/crypto'
import { getShop, listShops, getAuthor } from '@/app'
import { Pager } from '@/pager'

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
    url: { type: GraphQLString },
    width: { type: GraphQLInt },
    height: { type: GraphQLInt },
    authorId: { type: GraphQLString },
  },
})

const authorType = new GraphQLObjectType({
  name: 'Author',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    url: { type: GraphQLString },
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
          first,
          after,
          last,
          before,
        }: { first: number; after: string; last: number; before: string }
      ) => {
        const list = await listShops()
        const totalCount = list.shops.length

        after = convertCursorToId(after)
        before = convertCursorToId(before)

        const pager = new Pager({ nodes: list.shops })
        const result = pager.paging({ first, after, last, before })

        const edges = result.nodes.map((node) => {
          return {
            node,
            cursor: convertIdToCursor(node.id),
          }
        })

        return {
          totalCount,
          edges,
          pageInfo: {
            startCursor: result.startId ? convertIdToCursor(result.startId) : null,
            endCursor: result.endId ? convertIdToCursor(result.endId) : null,
            hasNextPage: result.hasNextPage,
            hasPreviousPage: result.hasPreviousPage,
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
        const shop = await getShop(id)
        return shop
      },
    },

    author: {
      type: authorType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: async (_, { id }) => {
        const author = await getAuthor(id)
        return author
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
