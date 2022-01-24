const asyncHandler = require('express-async-handler')
const { admin, otherdb, otherApp } = require('../utill/admin')

const { validateSignUpData, validateLoginData } = require('../utill/validators')

// @desc    Auth survey-app user and get token
///@route   POST /api/users/surveyApp/login
//@access   Public

const surveyAppAuthUser = asyncHandler(async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  }

  const { valid, errors } = validateLoginData(user)
  if (!valid) return res.status(400).json(errors)

  await otherApp
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

// @desc    Register survey-app new user
// @route   POST /api/users/surveyApp/
// @access  Public

const surveyAppRegisterUser = asyncHandler(async (req, res) => {
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
  otherdb
    .doc(`/user/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        res.status(400)
        throw new Error('User name already exists')
      } else {
        return otherApp
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
      return otherdb.doc(`/users/${newUser.username}`).set(user)
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

module.exports = {
  surveyAppAuthUser,
  surveyAppRegisterUser,
}
