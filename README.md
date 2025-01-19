# Ramen API :ramen:

**Ramen API** is a free Web API about :ramen:.
This API is designed for the purpose of testing a software application which is accessing Web APIs.
For example, you can use Ramen API for prototyping your React, Vue, or Angular web pages.

You can try Ramen API with this code.

```js
fetch('https://ramen-api.dev/shops/yoshimuraya')
  .then((res) => res.json())
  .then((json) => console.log(json.shop.name)) // => 吉村家
```

This repository manages the source code and the content including photos.

You might want to say _why Ramen?_ And, I will say. **_:ramen: is super delicious!! :yum:_**

## Features

- :star2: Support REST API and GraphQL.
- :framed_picture: We can get an information of Ramen shops and their rich photos.
- :free: Completely free.
- :technologist: You can contribute by adding Ramen content.

## Information

- **Currently, Ramen API is a beta version**. There's a possibility that API may be changed.
- You **should** show the credit like "_powered by Ramen API_" on your page and link to this GitHub repository.
- The information of Ramen shops and photos are distributed under the [Creative Commons copyright license _CC/BY_](https://creativecommons.org/licenses/by-sa/4.0/legalcode).
- If you want to use photos in your application publicly, you **should** show the author `id` or `name` of the photos as the credit.
- Authentication is not required.
- There is no rate-limitation.

## Base URL

```
https://ramen-api.dev
```

## TypeScript Types

```ts
type Photo = {
  name: string
  url: string
  width: number
  height: number
  authorId?: string
  author?: Author
}

type Shop = {
  id: string
  name?: string
  photos?: Photo[]
}

type Author = {
  id: string
  name: string
  url: string
}
```

## REST API

![SS](https://user-images.githubusercontent.com/10682/163718724-1dbe9ea5-6dda-47ae-962b-1657e157c64a.png)

### Global parameters

- `pretty` - Flag of JSON pretty printing.

### GET `/shops`

#### Parameters

- `page` - default is `1`.
- `perPage` - default is `10`. Maximum value is `100`.

#### Examples

```http
GET /shops?pretty&page=1&perPage=3
```

```json
{
  "shops": [
    {
      "id": "yoshimuraya",
      "name": "吉村家",
      "photos": [
        {
          "name": "yoshimuraya-001.jpg",
          "width": 1200,
          "height": 900,
          "authorId": "yusukebe",
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
          "authorId": "yusukebe",
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
          "authorId": "yusukebe",
          "url": "https://ramen-api.dev/images/takasagoya/takasagoya-001.jpg"
        }
      ]
    }
  ],
  "totalCount": 7,
  "pageInfo": {
    "nextPage": 2,
    "prevPage": null,
    "lastPage": 3,
    "perPage": 3,
    "currentPage": 1
  }
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

![SS](https://user-images.githubusercontent.com/10682/163718911-13195ea5-c7f5-423a-bd02-fb2823f30a61.png)

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
  shops(first: 1, after: "eW9zaGltdXJheWE=") {
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
  shops(last: 1, before: "eW9zaGltdXJheWE=") {
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

You can contribute by adding Ramen content to this project. Not only by writing code.

### Adding a new shop

#### 1. Fork & `clone`

Fork this repository and `clone` it.

#### 2. Edit the author information

If this is first time, you should write about you.

```sh
mkdir ./content/authors/{authorId}
touch ./content/authors/{authorId}/info.json
```

Edit `./content/authors/{authorId}/info.json` like this:

```javascript
{
  "id": "yusukebe", // <-- must be /^[0-9a-zA-Z\-\_]+$/
  "name": "Yusuke Wada",
  "url": "https://github.com/yusukebe" // <-- must be /^https:\/\/.+$/
}
```

#### 3. Edit about the Ramen shop

Write the information of the Ramen shop which you want to add.

```sh
mkdir ./content/shops/{shopId}
touch ./content/shops/{shopId}/info.json
```

Edit `./content/shops/{shopId}/info.json` like this:

```javascript
{
  "id": "yoshimuraya", // <-- must be /^[0-9a-z\-]+$/
  "name": "吉村家",
  "photos": [
    {
      "name": "yoshimuraya-001.jpg", // <-- must be /^[0-9a-z\-\.]+\.(jpg|jpeg|png|gif)$/
      "width": 1200, // <-- must be number
      "height": 900, // <-- must be number
      "authorId": "yusukebe" // <-- must be /^[0-9a-zA-Z\-\_]+$/
    }
  ]
}
```

#### 4. Add Photo

Add your Ramen photos to an appropriate path such as `./content/shops/{shopId}/{photoName}`.

```sh
cp IMG_001.JPG ./content/shops/{shopId}/{photoName}
```

#### 5. Add `shopId` to `shops.json`

At the end, edit `./content/shops.json` to add the shop id at the last line.

```javascript
{
  "shopIds": [
    "yoshimuraya",
    "sugitaya",
    "takasagoya",
    "jyoujyouya",
    "torakichiya",
    "rasuta",
    "new-shop-id" // <--- add the id at the last line
  ]
}
```

#### 6. Pull Request

Create Pull Request to this repository.

### Notices

- Do not upload a big size photo. Should be **under 300KB**.
- An information about the shop and photos that you have been uploaded will be licensed by [Creative Commons copyright license _CC/BY_](https://creativecommons.org/licenses/by-sa/4.0/legalcode).

## Tips

### Resize & Optimize photos

Resize:

```sh
sips -Z 800 yoshimuraya-001.jpg
```

Get the image size:

```sh
sips -g pixelHeight -g pixelWidth yoshimuraya-001.jpg
```

Remove Exif and optimize the image:

```sh
jpegtran -copy none -optimize -outfile yoshimuraya-001.jpg yoshimuraya-001.jpg
```

## Projects using Ramen API

- [yusukebe/ramen-api-example](https://github.com/yusukebe/ramen-api-example) - An example web pages with React and Cloudflare Workers.
- [sinyo-matu/ramen-sasshi](https://github.com/sinyo-matu/ramen-sasshi) - a web site created with Fresh2 hosted by Deno Deploy

## Author

Yusuke Wada <https://github.com/yusukebe>

:heart: :ramen:

## License

Application source code is distributed under the MIT license.

Ramen resources including the photos are distributed under the [Creative Commons copyright license _CC/BY_](https://creativecommons.org/licenses/by-sa/4.0/legalcode).
