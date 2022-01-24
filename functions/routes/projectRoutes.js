const express = require('express')
const router = express.Router()
const {
  getProjects,
  getAllProjects,
  getProjectById,
  createProject,
  uploadImage,
  getProjectByIdTableData,
} = require('../controllers/projectController')

const { protect, isadmin } = require('../middleware/authMiddleware')

router.route('/').get(protect, getProjects).post(protect, createProject)

router.route('/all').get(protect, isadmin, getAllProjects)

router.route('/:id').get(protect, getProjectById)

router.route('/image/:id').post(protect, uploadImage)

router.route('/:id/data').get(protect, getProjectByIdTableData)

module.exports = router
