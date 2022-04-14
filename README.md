# Ramen API :ramen:

**Ramen API** is a public Web API anyone can access.
For a purpose of testing your application accessing Web APIs.
For example, you can use Ramen API when prototyping such as a React user interface.

## Features

* Support REST API and GraphQL.
* We can get Japanese Ramen shop information and the photos.
* Completely free.
* You can contribute for adding Ramens.
* And... Ramen :ramen: is awesome!!!

## Information

* Ramen shop infromatin and Photos are under the Creative Commons copyright license *CC/BY*.
* If you use photos in your application publicly, you **should** show the author `id` or `name` of the photos as the credit.

## Basic

* Base URL is *\<<https://ramen-api.dev>\>*.
* Authentication is not required.
* There is no rate limitation.

## REST API

### Global parameters

* `pretty` - Flag of JSON pretty printting.

### GET `/shops`

#### Parameters

* `limit` - default is `10`.
* `offset` - default is `0`.

#### Examples

```text
GET https://ramen-api.dev/shops
```

```json
{
  "totalCount": 3,
  "shops": [
    {
      "id": "yoshimuraya",
      "name": "吉村家",
      "photos": [
        {
          "name": "yoshimuraya-001.jpg",
          "author": "yusukebe",
          "url": "https://ramen-api.dev/images/yoshimuraya/yoshimuraya-001.jpg"
        }
      ]
    },
    {
      "id": "sugitaya",
      "name": "杉田家",
      "photos": [
        {
          "name": "sugitaya-001.jpg",
          "author": "yusukebe",
          "url": "https://ramen-api.dev/images/sugitaya/sugitaya-001.jpg"
        }
      ]
    },
    {
      "id": "takasagoya",
      "name": "たかさご家",
      "photos": [
        {
          "name": "takasagoya-001.jpg",
          "author": "yusukebe",
          "url": "https://ramen-api.dev/images/takasagoya/takasagoya-001.jpg"
        }
      ]
    },
  ]
}
```

### GET `/shops/{shopId}`

#### Examples

```text
GET https://ramen-api.dev/shops/yoshimuraya
```

```json
{
  "shop": {
    "id": "yoshimuraya",
    "name": "吉村家",
    "photos": [
      {
        "name": "yoshimuraya-001.jpg",
        "author": "yusukebe",
        "url": "https://ramen-api.dev/images/yoshimuraya/yoshimuraya-001.jpg"
      }
    ]
  }
}
```

### GET `/authors/{authorId}`

#### Examples

```text
GET https://ramen-api.dev/authors/yusukebe
```

```json
{
  "author": {
    "id": "yusukebe",
    "name": "Yusuke Wada",
    "url": "https://github.com/yusukebe"
  }
}
```

## Error

### Not Found

HTTP Status code is `404`.

Sample response:

```json
{
  "errors": [
    {
      "message": "The requested Ramen Shop 'foo' is not found"
    }
  ]
}
```

## GraphQL

### Schemas

#### Shop

```graphql
type Shop {
  id: String
  name: String
  photos: [Photo]
}
```

#### Photo

```graphql
type Photo {
  name: String
  url: String
  authorId: String
}
```

#### Author

```graphql
type Author {
  id: String
  name: String
  url: String
}
```

### Queries

#### `shop`

```graphql
query {
  shop(id: "yoshimuraya") {
    id
    name
    photos {
      name
      url
      authorId
    }
  }
}
```

#### `shops`

```graphql
query {
  shops(first:1, after: "eW9zaGltdXJheWE=") {
    edges {
      node {
        id
        name
      }
      cursor
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
```

Or you can set `last` and `before` args.

```graphql
query {
  shops(last:1, before: "eW9zaGltdXJheWE=") {
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
```

#### `author`

```graphql
query {
  author(id: "yusukebe") {
    id
    name
    url
  }
}
```

## Contribution

## Tips

### Resize & Optimize photos

Resize:

```sh
sips -Z 1200 yoshimuraya-001.jpg
```

Remove Exif information and optimize the image:

```sh
jpegtran -copy none -optimize -outfile yoshimuraya-001.jpg yoshimuraya-001.jpg
```

## Author

Yusuke Wada <https://github.com/yusukebe>

## License

Application souce code is distributed under MIT license.

Ramen resources including the photos contrbuters added are under the [Creative Commons License BY/SA](https://creativecommons.org/licenses/by-sa/4.0/legalcode).
