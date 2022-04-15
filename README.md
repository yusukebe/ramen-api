# Ramen API :ramen:

**Ramen API** is a free Web API about :ramen:.
This API is designed for the purpose of testing your software application which is accessing Web APIs.
For example, you can use Ramen API when you are prototyping such as a React, Vue, and Angular interface.

You can try Ramen API with this code.

```js
fetch('https://ramen-api.dev/shops/yoshimuraya')
  .then(res => res.json())
  .then(json => console.log(json.shop.name)) // => 吉村家
```

This repository manages the application source code and the content including photos.

You might want to say *why Ramen?* And, I will say. ***:ramen: is super delicious!! :yum:***

## Features

* :star2: Support REST API and GraphQL.
* :framed_picture: We can get an information of Ramen shops and the rich photos.
* :free: Completely free.
* :technologist: You can contribute by adding Ramen content.

## Information

* **Currently, Ramen API is a beta version**.
* The information of a Ramen shop and photos are under the [Creative Commons copyright license *CC/BY*](https://creativecommons.org/licenses/by-sa/4.0/legalcode).
* If you use photos in your application publicly, you **should** show the author `id` or `name` of the photos as a credit.
* Authentication is not required.
* There is no rate-limitation.

## Base URL

```
https://ramen-api.dev
```

## REST API

### Global parameters

* `pretty` - Flag of JSON pretty printing.

### GET `/shops`

#### Parameters

* `limit` - default is `10`.
* `offset` - default is `0`.

#### Examples

```http
GET /shops
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
          "width": 1200,
          "height": 900,
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
          "width": 1200,
          "height": 900,
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
          "width": 1200,
          "height": 900,
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

```http
GET /shops/yoshimuraya
```

```json
{
  "shop": {
    "id": "yoshimuraya",
    "name": "吉村家",
    "photos": [
      {
        "name": "yoshimuraya-001.jpg",
        "width": 1200,
        "height": 900,
        "author": "yusukebe",
        "url": "https://ramen-api.dev/images/yoshimuraya/yoshimuraya-001.jpg"
      }
    ]
  }
}
```

### GET `/authors/{authorId}`

#### Examples

```http
GET /authors/yusukebe
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

## Errors

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

Ramen API supports a GraphQL.

### Endpoint

```sh
https://ramen-api.dev/graphql
```

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
  width: Int
  height: Int
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
      width
      height
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

You can contribute to Ramen API by adding Ramen content to this project. Not only by writing code.

### Adding a new shop

If this is first time, you should write about you.

```sh
mkdir ./content/authors/{authorId}
touch ./content/authors/{authorId}/info.json
// edit info.json
```

Write an information of the Ramen shop which you want to add.

```sh
mkdir ./content/shops/{shopId}
touch ./content/shops/{shopId}/info.json
// edit info.json
```

Add your Ramen photos to an appropriate path such as `./content/shops/{shopId}/{photoName}`.

At last, edit `./content/shops.json` to add the shop id.

### Notices

* Do not upload a big size photo. Should be **under 400KB**.
* An information about the shop and photos that you have been uploaded will be licensed by [Creative Commons copyright license *CC/BY*](https://creativecommons.org/licenses/by-sa/4.0/legalcode).

## Tips

### Resize & Optimize photos

Resize:

```sh
sips -Z 1200 yoshimuraya-001.jpg
```

Get the image size:

```sh
sips -g pixelHeight -g pixelWidth yoshimuraya-001.jpg
```

Remove Exif and optimize the image:

```sh
jpegtran -copy none -optimize -outfile yoshimuraya-001.jpg yoshimuraya-001.jpg
```

## Author

Yusuke Wada <https://github.com/yusukebe>

:heart: :ramen:

## License

Application source code is distributed under the MIT license.

Ramen resources including the photos are distributed under the [Creative Commons copyright license *CC/BY*](https://creativecommons.org/licenses/by-sa/4.0/legalcode).
