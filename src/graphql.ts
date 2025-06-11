import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt,
} from 'graphql'
import { getShop, listShops, getAuthor, type Shop, type Options } from '@/app'
import { Pager } from '@/pager'

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

const getQueryType = (options: Options) => {
  const queryType = new GraphQLObjectType({
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
          const list = await listShops({}, options)
          for (let i = 0; i < list.shops.length; i++) {
            list.shops[i] = await setShopPhotoAuthor(list.shops[i], options)
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
          let shop = await getShop(id, options)
          shop = await setShopPhotoAuthor(shop, options)
          return shop
        },
      },

      author: {
        type: authorType,
        args: {
          id: { type: GraphQLString },
        },
        resolve: async (_, { id }) => {
          const author = await getAuthor(id, options)
          return author
        },
      },
    },
  })
  return queryType
}

const setShopPhotoAuthor = async (shop: Shop, options: Options): Promise<Shop> => {
  for (let i = 0; i < shop.photos.length; i++) {
    const authorId = shop.photos[i].authorId
    if (authorId) {
      shop.photos[i].author = await getAuthor(authorId, options)
      delete shop.photos[i].authorId
    }
  }
  return shop
}

export const convertIdToCursor = (id: string): string => {
  const cursor = btoa(id)
  return cursor
}

export const convertCursorToId = (cursor: string): string => {
  return atob(cursor)
}

export const getSchema = (options: Options) => {
  const schema = new GraphQLSchema({ query: getQueryType(options) })
  return schema
}
