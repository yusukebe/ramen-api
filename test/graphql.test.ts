import { app } from '@/index'
import { BASE_URL } from '@/app'
import { assign } from '@/mock'

assign()

describe('Test /graphql', () => {
  it('Should return 400 response', async () => {
    const res = await app.request('http://localhost/graphql')
    expect(res.status).toBe(400)
  })
})

const postRequest = async (data: object): Promise<Response> => {
  const req = new Request('http://localhost/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return await app.request(req)
}

describe('Query shop', () => {
  it('Should return Shop response', async () => {
    const query = {
      query: `
      query getShop($id: String!) {
        shop(id: $id) {
          id
          name
          photos {
            name
            url
            width
            height
            authorId
          }
        }
    }`,
      variables: JSON.stringify({ id: 'yoshimuraya' }),
    }
    const res = await postRequest(query)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data['data']['shop']).not.toBeUndefined()
    expect(data['data']['shop']).toEqual({
      id: 'yoshimuraya',
      name: '吉村家',
      photos: [
        {
          name: 'yoshimuraya-001.jpg',
          url: `${BASE_URL}images/yoshimuraya/yoshimuraya-001.jpg`,
          width: 1200,
          height: 900,
          authorId: 'yusukebe',
        },
      ],
    })
  })
})

describe('Query shops', () => {
  it('Return null', async () => {
    const query = {
      query: `
      {
        shops {
            edges {
                node {
                    id
                }
                cursor
            }
            totalCount
            pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
            }
        }
    }
      `,
    }
    const res = await postRequest(query)
    expect(res.status).toBe(200)
    const data = await res.json()
    const shops = data['data']['shops']
    expect(shops).toBeNull()
  })

  it('Should return all edges', async () => {
    const query = {
      query: `
      {
        shops(first: 10) {
            edges {
                node {
                    id
                }
                cursor
            }
            totalCount
            pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
            }
        }
    }
      `,
    }
    const res = await postRequest(query)
    expect(res.status).toBe(200)
    const data = await res.json()
    const shops = data['data']['shops']
    expect(shops).not.toBeUndefined()
    expect(shops['edges']).toEqual([
      {
        node: {
          id: 'yoshimuraya',
        },
        cursor: 'eW9zaGltdXJheWE=',
      },
      {
        node: {
          id: 'sugitaya',
        },
        cursor: 'c3VnaXRheWE=',
      },
      {
        node: {
          id: 'takasagoya',
        },
        cursor: 'dGFrYXNhZ295YQ==',
      },
    ])
    expect(shops['totalCount']).toBe(3)
    expect(shops['pageInfo']).toEqual({
      startCursor: 'eW9zaGltdXJheWE=',
      endCursor: 'dGFrYXNhZ295YQ==',
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })

  it('With pagination - first:1', async () => {
    const query = {
      query: `
      {
        shops(first: 1) {
            pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
            }
        }
    }
      `,
    }
    const res = await postRequest(query)
    expect(res.status).toBe(200)
    const data = await res.json()
    const shops = data['data']['shops']
    expect(shops['pageInfo']).toEqual({
      startCursor: 'eW9zaGltdXJheWE=',
      endCursor: 'eW9zaGltdXJheWE=',
      hasNextPage: true,
      hasPreviousPage: false,
    })
  })

  it('With pagination - first:2, after: "eW9zaGltdXJheWE="', async () => {
    const query = {
      query: `
      {
        shops(first: 2, after: "eW9zaGltdXJheWE=") {
            pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
            }
        }
    }
      `,
    }
    const res = await postRequest(query)
    expect(res.status).toBe(200)
    const data = await res.json()
    const shops = data['data']['shops']
    expect(shops['pageInfo']).toEqual({
      startCursor: 'c3VnaXRheWE=',
      endCursor: 'dGFrYXNhZ295YQ==',
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  it('With pagination - after: "c3VnaXRheWE="', async () => {
    const query = {
      query: `
      {
        shops(first: 10, after: "c3VnaXRheWE=") {
            pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
            }
        }
    }
      `,
    }
    const res = await postRequest(query)
    expect(res.status).toBe(200)
    const data = await res.json()
    const shops = data['data']['shops']
    expect(shops['pageInfo']).toEqual({
      startCursor: 'dGFrYXNhZ295YQ==',
      endCursor: 'dGFrYXNhZ295YQ==',
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  // yoshimuraya ---> eW9zaGltdXJheWE=
  // sugitaya ---> c3VnaXRheWE=
  // takasagoya ---> dGFrYXNhZ295YQ==

  it('With pagination - first: 1, after: "dGFrYXNhZ295YQ=="', async () => {
    const query = {
      query: `
      {
        shops(first: 1, after: "dGFrYXNhZ295YQ==") {
            pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
            }
        }
    }
      `,
    }
    const res = await postRequest(query)
    expect(res.status).toBe(200)
    const data = await res.json()
    const shops = data['data']['shops']
    expect(shops['pageInfo']).toEqual({
      startCursor: null,
      endCursor: null,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  it('With pagination - last: 2', async () => {
    const query = {
      query: `
      {
        shops(last: 2) {
            pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
            }
        }
    }
      `,
    }
    const res = await postRequest(query)
    expect(res.status).toBe(200)
    const data = await res.json()
    const shops = data['data']['shops']
    expect(shops['pageInfo']).toEqual({
      startCursor: 'c3VnaXRheWE=',
      endCursor: 'dGFrYXNhZ295YQ==',
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  it('With pagination - last: 10, before: "c3VnaXRheWE="', async () => {
    const query = {
      query: `
      {
        shops(last:10, before: "c3VnaXRheWE=") {
            pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
            }
        }
    }
      `,
    }
    const res = await postRequest(query)
    expect(res.status).toBe(200)
    const data = await res.json()
    const shops = data['data']['shops']
    expect(shops['pageInfo']).toEqual({
      startCursor: 'eW9zaGltdXJheWE=',
      endCursor: 'eW9zaGltdXJheWE=',
      hasNextPage: true,
      hasPreviousPage: false,
    })
  })
})

describe('Query author', () => {
  it('Should return Author response', async () => {
    const query = {
      query: `
      query getAuthor($id: String!) {
        author(id: $id) {
          id
          name
          url
        }
    }`,
      variables: JSON.stringify({ id: 'yusukebe' }),
    }
    const res = await postRequest(query)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data['data']['author']).not.toBeUndefined()
    expect(data['data']['author']).toEqual({
      id: 'yusukebe',
      name: 'Yusuke Wada',
      url: 'https://github.com/yusukebe',
    })
  })
})
