const express = require('express')
const router = express.Router()
const {createReview} = require("../controllers/reviewController")
const { authenticate, authorise } = require("../middlewares/authMiddleware")
const userController = require('../controllers/userController')
const { createUser, loginUser } = userController
const { createBook, getAllBooks } = require("../controllers/bookController")
router.post("/register", createUser)
router.post("/login", loginUser)

router.post("/books",authenticate, authorise,createBook)
router.get("/books", authenticate, getAllBooks)
router.get("/books/:bookId", authenticate,authorise, getAllBooks)
router.put("/books/:bookId", authenticate,authorise, getAllBooks)

router.post("/books/:bookId/review", authenticate,authorise, createReview)
router.put("/books/:bookId/review/:reviewId", authenticate,authorise, createReview)
module.exports = router