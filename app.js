// BACKEND
require('dotenv').config()

// console.log(process.env.PRISMIC_END_POINT, process.env.PRISMIC_CLIENT_ID)

const express = require('express')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const logger = require('morgan')

const app = express()
const path = require('path')
const port = 3000

app.use(logger('dev'))
app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extend: false }))
app.use(methodOverride())

app.use(express.static('public'))

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
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  }

  if (doc.type === 'collections') {
    return '/collections'
  }

  if (doc.type === 'about') {
    return '/about'
  }

  return '/'
}

// Middleware to inject prismic context (from prismic docs)
app.use((req, res, next) => {
  res.locals.Link = handleLinkResolver

  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM

  // OJO AQUI abajocomo se envia a collections.pug por ejemplo
  res.locals.Numbers = index => {
    return index == 0 ? 'One' : index == 1 ? 'Two' : index == 2 ? 'Three' : index == 3 ? 'Four' : ''
  }
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const handleRequest = async api => {
  const meta = await api.getSingle('meta')
  const preloader = await api.getSingle('preloader')
  const navigation = await api.getSingle('navigation')

  return {
    meta,
    navigation,
    preloader
  }
}

app.get('/', async (req, res) => {
  const api = await initApi(req)
  const home = await api.getSingle('home')
  const defaults = await handleRequest(api)

  const { results: collections } = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })

  res.render('pages/home', {
    ...defaults,
    collections,
    home
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const about = await api.getSingle('about')
  const defaults = await handleRequest(api)

  // console.log(response)
  // response is the response object. Render your views here.

  res.render('pages/about', {
    about,
    ...defaults

  })
})

app.get('/collections', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('home')
  const { results: collections } = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })
  console.log(collections)

  collections.forEach(collection => {
    console.log(collection.data.products[0].products_product)
  })

  res.render('pages/collections', {
    home,
    collections,
    ...defaults
  })
})

app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  })

  res.render('pages/detail', {
    ...defaults,
    product
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
