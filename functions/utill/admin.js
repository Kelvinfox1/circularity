const admin = require('firebase-admin')
const config2 = require('./config2')
const config = require('./config')

admin.initializeApp(config)

const otherApp = admin.initializeApp(config2, 'other')

const db = admin.firestore()
const otherdb = otherApp.firestore()

module.exports = { admin, db, otherdb, otherApp }
