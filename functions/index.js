const functions = require('firebase-functions')
const express = require('express')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const projectRoutes = require('./routes/projectRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()

app.use(express.json())

app.use('/projects', projectRoutes)
app.use('/users', userRoutes)

app.use(notFound)

app.use(errorHandler)

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.api = functions.https.onRequest(app)
