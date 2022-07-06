const express = require('express')
const route = express.Router()
const userController = require('../controllers/userController')
const {createUser} = userController
router.post("/register", createUser)

module.exports = route