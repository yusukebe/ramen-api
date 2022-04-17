import { encodeBase64, decodeBase64 } from 'hono/utils/crypto'
import { getShop, listShops, getAuthor, Photo, Author, Shop } from '@/app'
import { Pager } from '@/pager'

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt,
} from 'graphql'

const authorType = new GraphQLObjectType({
  name: 'Author',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    url: { type: GraphQLString },
  },
})

const photoType = new GraphQLObjectType({
  name: 'Photo',
  fields: {
    name: { type: GraphQLString },
    url: { type: GraphQLString },
    width: { type: GraphQLInt },
    height: { type: GraphQLInt },
    author: { type: authorType },
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
        for (let i = 0; i < list.shops.length; i++) {
          list.shops[0] = await setShopPhotoAuthor(list.shops[0])
        }
        const totalCount = list.shops.length

        after = after ? convertCursorToId(after) : null
        before = before ? convertCursorToId(before) : null

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
            startCursor: result.startId
              ? convertIdToCursor(result.startId)
              : null,
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
        let shop = await getShop(id)
        shop = await setShopPhotoAuthor(shop)
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

const setShopPhotoAuthor = async (shop: Shop): Promise<Shop> => {
  for (let i = 0; i < shop.photos.length; i++) {
    const authorId = shop.photos[i].authorId
    if (authorId) {
      shop.photos[i].author = await getAuthor(authorId)
      delete shop.photos[i].authorId
    }
  }
  return shop
}

export const convertIdToCursor = (id: string): string => {
  return encodeBase64(id)
}

export const convertCursorToId = (cursor: string): string => {
  return decodeBase64(cursor)
}

export const schema = new GraphQLSchema({ query: queryType })
