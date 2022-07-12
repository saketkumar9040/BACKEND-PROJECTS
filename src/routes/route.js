const express = require('express')
const router = express.Router()
const {createReview,updateReview, deleteReviewById} = require("../controllers/reviewController")
const { authentication, authorise } = require("../middlewares/authMiddleware")
const userController = require('../controllers/userController')
const { createUser, loginUser } = userController
const {createBook, getAllBooks, getBookById, updateBook, deleteBookById } = require("../controllers/bookController")

router.post("/register", createUser)
router.post("/login", loginUser)

router.post("/books",authentication,authorise,createBook)
router.get("/books", authentication, getAllBooks)
router.get("/books/:bookId", authentication, getBookById)
router.put("/books/:bookId", authentication,authorise, updateBook)
router.delete("/books/:bookId",authentication,authorise, deleteBookById)

router.post("/books/:bookId/review", createReview)
router.put("/books/:bookId/review/:reviewId", updateReview)
router.delete("/books/:bookId/review/:reviewId", deleteReviewById)

module.exports = router
////

