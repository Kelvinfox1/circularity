const asyncHandler = require('express-async-handler')
const { admin, db } = require('../utill/admin')

const config = require('../utill/config')

const firebase = require('firebase')

firebase.initializeApp(config)

const { validateSignUpData, validateLoginData } = require('../utill/validators')

// @desc    Auth user and get token
///@route   POST /api/users/login
//@access   Public

const authUser = asyncHandler(async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  }

  const { valid, errors } = validateLoginData(user)
  if (!valid) return res.status(400).json(errors)

  await firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken()
    })
    .then((token) => {
      return res.json({ token })
    })
    .catch((error) => {
      console.error(error)
      res.status(401)
      throw new Error('Invalid email or password')
    })
})

// @desc    Register a new user
// @route   POST /api/users
// @access  Public

const registerUser = asyncHandler(async (req, res) => {
  const newUser = {
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    idnumber: req.body.idnumber,
    phonenumber: req.body.phonenumber,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  }

  const { valid, errors } = validateSignUpData(newUser)

  if (!valid) return res.status(400).json(errors)

  let token, userId
  db.doc(`/user/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        res.status(400)
        throw new Error('User name already exists')
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then((data) => {
      userId = data.user.uid
      return data.user.getIdToken()
    })
    .then((idtoken) => {
      token = idtoken
      const user = {
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstname,
        lastName: newUser.lastname,
        isAdmin: false,
        idNumber: newUser.idnumber,
        phoneNumber: newUser.phonenumber,
        createdAt: new Date().toISOString(),
        userId,
      }
      return db.doc(`/users/${newUser.username}`).set(user)
    })
    .then(() => {
      return res.status(201).json({ token })
    })
    .catch((error) => {
      console.error(error)
      if (error.code === 'auth/email-already-in-use') {
        res.status(400).json(error)
        // throw new Error('Email already in use')
      } else {
        res.status(500)
        throw new Error('Something went wrong, please try again')
      }
    })
})

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private

const getUserProfile = asyncHandler(async (req, res) => {
  let userData = {}
  db.doc(`/users/${req.user.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData = doc.data()
        return res.json(userData)
      }
    })
    .catch((error) => {
      res.status(500)
      throw new Error(error.code)
    })
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  let document = db.collection('users').doc(`${req.user.username}`)
  document
    .update(req.body)
    .then(() => {
      res.json({ message: 'Updated successfully' })
    })
    .catch((error) => {
      console.error(error)
      return res.status(500).json({
        message: 'Cannot Update the value',
      })
    })
})

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin

const getUsers = asyncHandler(async (req, res) => {
  const users = []
  await db
    .collection('users')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        users.push(doc.data())
      })
      return res.json(users)
    })
    .catch((error) => {
      console.error(error)
      res.status(500).json({ error: error.code })
    })
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin

const deleteUser = asyncHandler(async (req, res) => {
  admin
    .auth()
    .deleteUser(req.params.id)
    .then(() => {
      res.json({ message: 'Successfully deleted user' })
    })
    .catch((error) => {
      return res.status(500).json({
        message: `Error deleting user ${error}`,
      })
    })
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin

const getUserById = asyncHandler(async (req, res) => {
  await db
    .collection('users')
    .where('userId', '==', req.params.id)
    .get()
    .then((data) => {
      let user = {}
      data.forEach((doc) => {
        user = doc.data()
      })
      res.json(user)
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  let document = db.collection('users').where('userId', '==', req.params.id)
  document
    .update(req.body)
    .then(() => {
      res.json({ message: 'Updated successfully' })
    })
    .catch((error) => {
      console.error(error)
      return res.status(500).json({
        message: 'Cannot Update the value',
      })
    })
})

// @desc    Update user password and  veryfication and status
// @route   PUT /api/users/:id
// @access  Private/Admin

const updateUserRoles = asyncHandler(async (req, res) => {
  await admin
    .auth()
    .updateUser(uid, {
      email: 'modifiedUser@example.com',
      emailVerified: true,
      password: 'newPassword',
      disabled: true,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log('Successfully updated user', userRecord.toJSON())
    })
    .catch((error) => {
      console.log('Error updating user:', error)
    })
})

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
}
