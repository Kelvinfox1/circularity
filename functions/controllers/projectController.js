const asyncHandler = require('express-async-handler')
const { db, admin } = require('../utill/admin')
const cryptoRandomString = require('crypto-random-string')
const config = require('../utill/config')

// @desc    Fetch all projects
///@route   GET /api/projects
//@access   Private

const getProjects = asyncHandler(async (req, res) => {
  await db
    .collection('projects')
    .where('username', '==', req.user.username)
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let projects = []
      data.forEach((doc) => {
        projects.push({
          projectId: doc.id,
          title: doc.data().title,
          body: doc.data().body,
          code: doc.data().code,
          createdAt: doc.data().createdAt,
        })
      })
      return res.json(projects)
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
})

// @desc    Fetch single projects
///@route   GET /api/projects/:id
//@access   Private

const getProjectById = asyncHandler(async (req, res) => {
  await db
    .doc(`/projects/${req.params.id}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({
          error: 'Project not found',
        })
      }
      ProjectoData = doc.data()
      ProjectoData.projectId = doc.id
      return res.json(ProjectoData)
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).json({ error: error.code })
    })
})

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProject = asyncHandler(async (req, res) => {
  const project = db.doc(`/projects/${req.params.id}`)
  project.get().then((doc) => {
    if (doc.exists) {
      doc.delete()
      res.json({ message: 'Product removed' })
    } else {
      res.status(404)
      throw new Error('Product not found')
    }
  })
})

// @desc    Create a project
// @route   POST /api/project
// @access  Private/Admin
const createProject = asyncHandler(async (req, res) => {
  if (req.body.body.trim() == '') {
    res.status(400)
    throw new Error('you havent created any form add questions to continue')
  }

  if (req.body.title.trim() == '') {
    res.status(400)
    throw new Error('the form lacks a title input a title to continue')
  }
  const code = cryptoRandomString({ length: 5 })

  const project = {
    body: req.body.title,
    title: req.body.body,
    createdAt: new Date().toISOString(),
    code: code,
    ProjectImages: [],
    username: req.user.username,
    numberOfInterviewers: 0,
    submissions: 0,
  }
  db.collection('projects')
    .add(project)
    .then((doc) => {
      const responseProject = project
      responseProject.id = doc.id
      return res.json(responseProject)
    })
    .catch((err) => {
      res.status(500)
      throw new Error('Something went wrong ')
    })
})

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProject = asyncHandler(async (req, res) => {
  if (req.body.projectId || req.body.createdAt) {
    res.status(403)
    throw new Error('Not allowed to edit')
  }

  const project = db.doc(`/projects/${req.params.id}`)

  project
    .update({
      body: req.body,
      title: req.title,
    })
    .then(() => {
      res.json(updatedProduct)
    })
    .catch((err) => {
      res.status(404)
      throw new Error('Product not found', err)
    })
})

// @desc    Fetch all projects
///@route   GET /api/projects
//@access   Private admin

const getAllProjects = asyncHandler(async (req, res) => {
  await db
    .collection('projects')
    .get()
    .then((data) => {
      let projects = []
      data.forEach((doc) => {
        projects.push({
          projectId: doc.id,
          title: doc.data().title,
          body: doc.data().body,
          code: doc.data().code,
          createdAt: doc.data().createdAt,
          submissions: doc.data().submissions,
          username: doc.data().username,
        })
      })
      return res.json(projects)
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
})

// @desc    Post images to be used in a project
///@route   POST /api/projects/images
//@access   Private

const uploadImage = asyncHandler(async (req, res) => {
  const BusBoy = require('busboy')
  const path = require('path')
  const os = require('os')
  const fs = require('fs')
  const busboy = new BusBoy({ headers: req.headers })

  let imageFileName
  let imageToBeUploaded = []
  const name = cryptoRandomString({ length: 10 })

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/png' && mimetype !== 'image/jpeg') {
      return res.status(400).json({ error: 'Wrong file type submited' })
    }
    const imageExtension = filename.split('.')[filename.split('.').length - 1]
    imageFileName = `${name}.${imageExtension}`
    const filePath = path.join(os.tmpdir(), imageFileName)
    imageToBeUploaded = { filePath, mimetype }
    file.pipe(fs.createWriteStream(filePath))
  })

  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
        return db.doc(`/projects/${req.params.id}`).update({
          ProjectImages: admin.firestore.FieldValue.arrayUnion(imageUrl),
        })
      })
      .then(() => {
        return res.json({ message: 'Image uploaded successfully' })
      })
      .catch((error) => {
        console.error(error)
        return res.status(500).json({ error: error.code })
      })
  })
  busboy.end(req.rawBody)
})

// @desc    Get response data for soecific project
///@route   GET /api/projects/:id/tables
//@access   Private

const getProjectByIdTableData = asyncHandler(async (req, res) => {
  await db
    .collection(`/responses/${req.params.id}/${req.params.id}`)
    .get()
    .then((data) => {
      let response = []
      data.forEach((doc) => {
        response.push({
          responseId: doc.id,
          date: doc.data().date,
          projectId: doc.data().project,
          interviewer: doc.data().interviewer,
          data: JSON.parse(doc.data().data),
          location: doc.data().location,
        })
      })
      return res.json(response)
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
})

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
  updateProject,
  getAllProjects,
  uploadImage,
  getProjectByIdTableData,
}
