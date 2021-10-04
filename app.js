// BACKEND
require('dotenv').config()

// console.log(process.env.PRISMIC_END_POINT, process.env.PRISMIC_CLIENT_ID)

const express = require('express')
const app = express()
const path = require('path')
const port = 3000

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

// Initialize the prismic.io api
const initApi = req => {
  return Prismic.getApi(process.env.PRISMIC_END_POINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  })
}

// Link Resolver (Prismic)
const handleLinkResolver = doc => {
  // Define the url depending on the document type

  // if (doc.type === 'page') {
  //  return '/page/' + doc.uid;
  // } else if (doc.type === 'blog_post') {
  //  return '/blog/' + doc.uid;
  // }

  // Default to homepage
  return '/'
}

// Middleware to inject prismic context (from prismic docs)
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_END_POINT,
    linkResolver: handleLinkResolver
  }

  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('pages/home')
})

app.get('/about', (req, res) => {
  initApi(req).then(api => {
    api.query([Prismic.Predicates.any('document.type', ['meta', 'about'])]).then(response => {
      // console.log(response)

      // response is the response object. Render your views here.

      const { results } = response
      const [about, meta] = results
      // console.log(about, meta)

      res.render('pages/about', {
        about,
        meta
      })
    })
  })
})

app.get('/collections', (req, res) => {
  res.render('pages/collections')
})

app.get('/detail/:uid', (req, res) => {
  res.render('pages/detail')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
