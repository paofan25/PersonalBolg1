const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')
const { uploadFile, deleteFile } = require('../controllers/uploadController')

// 文件上传
router.post('/', auth, uploadFile)

// 删除文件
router.delete('/:filename', auth, deleteFile)

module.exports = router