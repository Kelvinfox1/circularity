const express = require('express')
const router = express.Router()
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} = require('../controllers/userController')
const {
  surveyAppAuthUser,
  surveyAppRegisterUser,
} = require('../controllers/projectUserController')
const { protect, isadmin } = require('../middleware/authMiddleware')

router.route('/').post(registerUser).get(protect, isadmin, getUsers)
router.post('/login', authUser)
router
  .route('/profile')
  .get(protect, getUserProfile)
  .post(protect, updateUserProfile)

router
  .route('/:id')
  .delete(protect, isadmin, deleteUser)
  .get(protect, isadmin, getUserById)
  .put(protect, isadmin, updateUser)

router.route('/surveyApp').post(surveyAppRegisterUser)
router.post('/surveyApp/login', surveyAppAuthUser)

module.exports = router
