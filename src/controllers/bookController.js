const bookModel = require("../models/bookModel");
const reviewModel = require('../models/reviewModel')
const validator = require("../validations/validator");
const userModel = require("../models/userModel");
const { isValid, isValidBody, isValidObjectId, isValidTitle, isValidISBN, isValidReview, isValidDate } = validator;
const createBook = async function (req, res) {
    try {
        let data = req.body;
        let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = data;
        if (!isValid(data))
            return res.status(400).send({ Status: false, message: "Please Enter The Valid Book Details" });
        if (!isValid(title))
            return res.status(400).send({ Status: false, message: "Title Is Required" });
        if (!isValidTitle(title))
            return res.status(400).send({ Status: false, message: "Title Is Invalid (e.g- The Great Gatsby or The Hobbit or The Lord of the Rings)" });
        let findOneTitle = await bookModel.findOne({ title: title });
        if (findOneTitle)
            return res.status(400).send({ Status: false, message: "Title Is Already Exists" });

        if (!isValid(excerpt))
            return res.status(400).send({ Status: false, message: "Excerpt Is Required" });
        if (!isValidBody(excerpt))
            return res.status(400).send({ Status: false, message: "Excerpt Is Invalid (e.g- Don't give away what the reader can already get for free)" });

        if (!isValid(userId))
            return res.status(400).send({ Status: false, message: "UserId Is Required" });
        if (!isValidObjectId(userId))
            return res.status(400).send({ Status: false, message: "UserId Is Invalid (e.g- )" });

        if (!isValid(ISBN))
            return res.status(400).send({ Status: false, message: "ISBN Is Required" });
        if (!isValidISBN(ISBN))
            return res.status(400).send({ Status: false, message: "ISBN Is Invalid" });
        let findOneISBN = await bookModel.findOne({ ISBN: ISBN });
        if (findOneISBN)
            return res.status(400).send({ Status: false, message: "ISBN Is Already Exists" });

        if (!isValid(category))
            return res.status(400).send({ Status: false, message: "Category Is Required" });
        if (!isValidBody(category))
            return res.status(400).send({ Status: false, message: "Category Is Invalid" });

        if (!isValid(subcategory))
            return res.status(400).send({ Status: false, message: "Subcategory Is Required" });
        if (!isValidBody(subcategory))
            return res.status(400).send({ Status: false, message: "Subcategory Is Invalid" });

        if (!isValid(reviews))
            return res.status(400).send({ Status: false, message: "Reviews Is Required" });
        if (!isValidReview)
            return res.status(400).send({ Status: false, message: "Reviews Is Invalid" });

        if (!isValid(releasedAt))
            return res.status(400).send({ Status: false, message: "ReleasedAt Is Required" });
        if (!isValidDate(releasedAt))
            return res.status(400).send({ Status: false, message: "ReleasedAt Is Invalid" });

        let findUserId = await userModel.findOne({ _id: userId });
        if (!findUserId)
            return res.status(404).send({ Status: false, message: "UserId Is Not Found" });

        let book = await bookModel.create(data);
        return res.status(201).send({ Status: true, message: "Book Created Successfully", data: book });
    }
    catch (err) {
        res.status(500).send({ Staus: false, message: err.message });
    }

}
const getAllBooks = async function (req, res) {

    try {

        let data = req.query
        data.isDeleted = false

        if (!isValid(data.userId)) return res.status(400).send({ status: false, message: `UserId Value Should Not Be Blank` })
        if (!isValidObjectId(data.userId)) return res.status(400).send({ status: false, message: `Invalid userId.` })
        let checkUser = await userModel.findById(data.userId)
        if (!checkUser) return res.status(404).send({ status: false, message: "UserId Not Found" })

        if (!isValid(data.category)) return res.status(400).send({ status: false, message: `Category Value Should Not Be Blank` })
        if (!isValidBody(data.category)) return res.status(400).send({ status: false, message: "category Not Valid" })

        if (!isValid(data.subcategory)) return res.status(400).send({ status: false, message: `SubCategory Value Should Not Be Blank` })
        if (!isValidBody(data.subcategory)) return res.status(400).send({ status: false, message: "subcategory Not Valid" })
        if (data.subcategory) {
            let subCategory = data.subcategory.split(',').map((x) => (x.trim()))
            data.subcategory = subCategory
        }

        const bookList = await bookModel.find(data)
            .select({ subcategory: 0, ISBN: 0, isDeleted: 0, updatedAt: 0, createdAt: 0, __v: 0 }).sort({ title: 1 });


        if (!bookList.length) return res.status(404).send({ status: false, message: "Book Not Found" })

        res.status(200).send({ status: true, message: "Book List", data: bookList })

    } catch (err) {
        res.status(500).send({ status: false, error: err.stack })
    }
}
const getBookById = async function (req, res) {
    try {

        let bookId = req.params.bookId
        if (!bookId) return res.status(400).send({ status: false, message: `BookId Should  Be Present` })
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Invalid userId." })

        let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!checkBook) return res.status(404).send({ status: false, message: "BookId Not Found" })

        const getReviewsData = await reviewModel.find({ bookId: checkBook._id, isDeleted: false })
            .select({ deletedAt: 0, isDeleted: 0, createdAt: 0, __v: 0, updatedAt: 0 })

        checkBook.reviewsData = getReviewsData

        res.status(200).send({ status: true, message: "Book List", data: checkBook })

    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

const updateBook = async function (req, res) {
    try {

        const bookId = req.params.bookId
        const data = req.body

        if (!data) return res.status(400).send({ status: false, message: `Data Should  Be Present` })

        if (!isValid(data.title)) return res.status(400).send({ status: false, message: `Title Value Should Not Be Blank` })
        if (!isValidTitle(data.title)) return res.status(400).send({ status: false, message: "Title Is Invalid" })
        if (data.title) {
            const checkTitle = await bookModel.findOne({ title: data.title, isDeleted: false })
            if (checkTitle) return res.status(400).send({ status: false, message: `${data.title} is already exists.Please add a new title.` })
        }
        if (!isValid(data.excerpt)) return res.status(400).send({ status: false, message: `Excerpt Value Should Not Be Blank` })
        if (!isValidBody(data.excerpt)) return res.status(400).send({ status: false, message: "Excerpt Is Invalid" })

        if (!isValid(data.ISBN)) return res.status(400).send({ status: false, message: `ISBN Value Should Not Be Blank` })
        if (data.ISBN) {
            if (!isValidISBN(data.ISBN)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid ISBN(ISBN should be 13 digit)' })
            }
            const checkIsbn = await bookModel.findOne({ ISBN: data.ISBN, isDeleted: false })
            if (checkIsbn) return res.status(400).send({ status: false, message: `${data.ISBN} is already registered,Please add a New.` })
        }
        if (!isValid(data.releasedAt)) return res.status(400).send({ status: false, message: `ReleasedAt Value Should Not Be Blank` })
        if (data.releasedAt) {
            if (!isValidDate(data.releasedAt)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid Date(YYYY-MM-DD)' })
            }
        }

        const updateBookData = await bookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            { title: data.title, excerpt: data.excerpt, releasedAt: data.releasedAt, ISBN: data.ISBN },
            { new: true })

        res.status(200).send({ status: true, message: "Successfully updated book details.", data: updateBookData })

    } catch (err) {
        res.status(500).send({ status: false, Error: err.message })
    }
}
const deleteBookById = async function (req, res) {
    try{
    let bookId = req.params.bookId 
    if(!isValid(bookId)) return res.status(400).send({ status: false, message: 'please Enter The Book Id ' });
    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: `invalid book Id` })
  
    let deletedBook= await bookModel.findOneAndUpdate({$and:[{_id: bookId},{isDeleted:false}]}, {isDeleted: true})
    console.log(deletedBook)
    res.status(200).send({status: true, message:"book Deleted Successfully"})
    if(!deletedBook)return res.status(404).send({ status: false, message: `no Such Book In The Database` })
    } catch (err) {
    res.status(500).send({ status: false, error: err.message })
    }
}




module.exports = { createBook, getAllBooks, getBookById, updateBook }