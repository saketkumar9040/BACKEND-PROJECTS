const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const {isValid,isValidObjectId, isValidBody} = require('../validations/validator')


//========================== Review function to the book========================


const createReview = async function(req,res){
    try{
        let data = req.body
        let bookId = req.params.bookId
        let {reviewedBy,reviewedAt,rating} = data

        //--------------[Required/Mandatory field]--------------
        if(Object.keys(data)==0) 
        return res.status(400).send({status : false, message : 'no Data Entered'})

        // BookId validation
        if(!bookId) 
        return res.status(400).send({status : false, message : 'Please enter bookId in path params'})
        if(!isValidObjectId(bookId)) 
        return res.status(400).send({status : false, message : 'Invalid bookId'})

        // ReviewedBy Validation
        if(!reviewedBy) 
        return res.status(400).send({status : false, message : 'Please enter reviewedBy Key'})
        if(!isValid(reviewedBy)) 
        return res.status(400).send({status : false, message : ' reviewedBy Field Is Empty'})

        // ReviewedAt Validation
        if(!reviewedAt) 
        return res.status(400).send({status : false, message : 'Please enter ReviewedAt Key'})
        if(!isValid(reviewedAt)) 
        return res.status(400).send({status : false, message : ' reviewedAt Field Is Empty'})

        // Rating Validation
        if(!rating) 
        return res.status(400).send({status : false, message : 'Please Enter The Rating key'})
        if(typeof rating != 'number') 
        return res.status(400).send({status : false, message : 'You can only enter number in the rating (1-5)'})
        if(rating>5 || rating<0) 
        return res.status(400).send({status : false, message : 'You should enter between 1 to 5 in rating'})

        //---------------------------[ Checking BookId in DB (Valid or Not)]---------------------------

        const checkBookId = await bookModel.findOne({_id : bookId, isDeleted : false})
        if(!checkBookId) 
        return res.status(404).send({status : false, message : 'No such book/ Invalid bookId'})
       

        //---------------------------[ Update review number in book]---------------------------

        let value = checkBookId.reviews +1
        await bookModel.findOneAndUpdate(
            {_id : checkBookId._id},
            {$set :{reviews : value}}
        )
       

        //-----------------[Review Document Creation]-----------------

        const reviewData = await reviewModel.create({bookId : bookId, ...data})
        res.status(201).send({status : true, message : 'Success', data :{_id:reviewData._id,bookId:reviewData.bookId,reviewedBy:reviewData.reviewedBy,reviewedAt:reviewData.reviewedAt,rating:reviewData.rating,review:reviewData.review}})
    }
    catch(err){
        res.status(500).send({status : false, message : err.message})
    }
}

const updateReview = async function (req, res){
    try{
    
        const book_id = req.params.bookId;

        if(!isValid(book_id)) return res.status(400).send({ status: false, msg: `BookId Value Should Not Be Blank`})
        if (!isValidObjectId(book_id)) {
        return res.status(400).send({ status: false, message: "Invalid BookId." })
        }
        let checkBook=await bookModel.findById(book_id)
        if(!checkBook){
            return res.status(404).send({ status: false, message: "BookId Not Found" })
            }

        const review_Id = req.params.reviewId

        if(!isValid(review_Id)) return res.status(400).send({ status: false, msg: `ReviewId Value Should Not Be Blank`})
        if (!isValidObjectId(review_Id)) {
        return res.status(400).send({ status: false, message: "Invalid reviewId." })
        }
        let checkReview=await reviewModel.findById(review_Id)
        if(!checkReview){
        return res.status(404).send({ status: false, message: "reviewId Not Found" })
        }

        const data = req.body
        let{reviewedBy,rating,review}=data
        data.reviewedAt=new Date().toISOString()
        if(Object.keys(data).length===0)return res.status(400).send({ status: false, msg: "To Update Please Enter The Review Details" })
    
        //if(!isValid(data)) return res.status(400).send({ status: false, msg: "To Update Please Enter The Review Details" })

        if("reviewedBy" in data){
        if(!isValid(reviewedBy)) 
        return res.status(400).send({ status: false, msg: `ReviewedBy Value Should Not Be Blank` })
        if(reviewedBy){
        if (!isValid(reviewedBy)) {
        return res.status(400).send({ status: false, msg: "Reviewer can't be a number" })
        }}
    }
        if("rating" in data){
        if(!isValid(rating)) return res.status(400).send({ status: false, msg: `Ratting Value Should Not Be Blank`})
        if(rating){
        if (!(rating >= 1 && data.rating <= 5)) {
        return res.status(400).send({ status: false, message: "Rating must be in between 1 to 5." })
        }}
    }

        if("review" in data){
        if(!isValid(review)) return res.status(400).send({ status: false, msg: `Review Value Should Not Be Blank`})
        if(!isValidBody(review)){
        return res.status(400).send({ status: false, message: "Review must be present" })
        }
    }

    
        if (checkBook.isDeleted == true||checkReview.isDeleted==true){
        return res.status(400).send({ status: false, message: "Can't update review of a Deleted Book " })
        }
        const updateReviewData = await reviewModel.findOneAndUpdate({ _id: review_Id }, data,{ new: true }).select({ isDeleted:0 , createdAt: 0, __v: 0, updatedAt: 0 })
        let { _id, title, excerpt, userId ,category, subcategory, isDeleted, reviews, releasedAt, createdAt, updatedAt} = checkBook
        let reviewsData = [updateReviewData]
        let result = { _id, title, excerpt, userId ,category, subcategory, isDeleted, reviews, releasedAt, createdAt, updatedAt , reviewsData}
        res.status(200).send({ status: true, message: "Successfully updated the review of the book.", data: result })
    
    }catch(err){
        res.status(500).send({ status: false, Error: err.message })
    }
    }




    const deleteReviewById= async function (req,res){
        try{
    
          let data=req.params
          if(!data)return res.status(400).send({status:false,message:"no Params Entered"})
    
          let {reviewId,bookId}=data
    
          if(!reviewId)return res.status(400).send({status:false,message:"no ReviewId Entered In Params"})
          if(!isValidObjectId(reviewId))return res.status(400).send({status:false,message:" ReviewId Entered Is Not In Correct Format"})
    
          let checkReviewId=await reviewModel.findOne({_id:reviewId,isDeleted:false})
          if(!checkReviewId)return res.status(404).send({status:false,message:"no Such Review Exists"})
    
          if(!bookId)return res.status(400).send({status:false,message:"no bookId Entered In Params"})
          if(!isValidObjectId(bookId))return res.status(400).send({status:false,message:" bookId Entered Is Not In Correct Format"})
    
          let checkBookId=await bookModel.findOne({$and:[{_id:bookId,isDeleted:false}]})
          if(!checkBookId)return res.status(404).send({status:false,message:"no Such Book Id Exists"})

          if(checkReviewId.bookId != bookId) return res.status(400).send({status : false, message : 'No such review to the given book'})
          if(checkBookId.reviews<=0) return res.status(400).send({status : false, message : "This book don't have any review"})

        let deleteReview=await reviewModel.findOneAndUpdate({$and:[{_id:reviewId},{isDeleted:false}]},{isDeleted:true})
      
        let updateBookReview= await bookModel.findOneAndUpdate({_id:bookId},{$inc:{reviews:-1}})
          //let updateBookReview= await bookModel.findOneAndUpdate({_id:bookId},{reviews:reviews-1})
          res.status(200).send({status:true,message:"Successfully Deleted The Review"})
        }catch(error){
            res.status(500).send({status:false,message:error.message})
        }
      }
module.exports = {createReview, updateReview,  deleteReviewById}
