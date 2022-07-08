const express = require('express')
const router = express.Router()
const {createReview,updateReview, deleteReviewById} = require("../controllers/reviewController")
const { authenticate, authorise } = require("../middlewares/authMiddleware")
const userController = require('../controllers/userController')
const { createUser, loginUser } = userController
const {createBook, getAllBooks, getBookById, updateBook, deleteBookById } = require("../controllers/bookController")
router.post("/register", createUser)
router.post("/login", loginUser)

router.post("/books",authenticate, authorise,createBook)
router.get("/books", authenticate, getAllBooks)
router.get("/books/:bookId", authenticate,authorise, getBookById)
router.put("/books/:bookId", authenticate,authorise, updateBook)
router.delete("/books/:bookId", authenticate,authorise, deleteBookById)

router.post("/books/:bookId/review", authenticate,authorise, createReview)
router.put("/books/:bookId/review/:reviewId", authenticate,authorise, updateReview)
router.delete("/books/:bookId/review/:reviewId", authenticate,authorise, deleteReviewById)

module.exports = router