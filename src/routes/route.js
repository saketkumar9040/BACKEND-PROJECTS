const express = require('express')
const router = express.Router()
const {authenticate} = require("../middlewares/authMiddleware")
const userController = require('../controllers/userController')
const {createUser,loginUser} = userController
const {createBook, getAllBooks} = require("../controllers/bookController")
router.post("/register", createUser)
router.post("/login", loginUser)

router.post("/books", createBook)
router.get("/books",authenticate, getAllBooks)

module.exports = router