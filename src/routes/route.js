const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const {createUser,loginUser} = userController
const {createBook} = require("../controllers/bookController")
router.post("/register", createUser)
router.post("/login", loginUser)

router.post("/books", createBook)

module.exports = router