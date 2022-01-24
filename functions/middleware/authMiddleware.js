const { admin, db } = require('../utill/admin')

const protect = (request, response, next) => {
  let token
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1]
  } else {
    console.error('No token found')
    return response.status(403).json('Unauthorized')
  }
  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      request.user = decodedToken
      return db
        .collection('users')
        .where('userId', '==', request.user.uid)
        .limit(1)
        .get()
    })
    .then((data) => {
      request.user.username = data.docs[0].data().username
      request.user.isAdmin = data.docs[0].data().isAdmin
      request.user.imageUrl = data.docs[0].data().imageUrl
      return next()
    })
    .catch((err) => {
      console.error('Error while verifying token', err)
      return response.status(403).json(err)
    })
}

const isadmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(401)
    throw new Error('Not authorized as an admin')
  }
}

module.exports = { protect, isadmin }
