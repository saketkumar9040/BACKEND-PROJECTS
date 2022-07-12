const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const { isValidObjectId } = require("../validations/validator")


        const authentication= async function(req,res,next){
            try{
             let token= req.headers["X-Api-key"];
             if(!token) token= req.headers["x-api-key"]
             if (!token) return res.send({ status: false, message: "token must be present" }); 
             jwt.verify(token, "DFGHJK34567890--85643ytfhgjkl",function (err, decoded) {
                if (err) {
                     return res.status(401).send({ status: false, message: "invalid token" })
                } else {
                    console.log(decoded)
                    req.decodedToken=decoded
                    next()
                }
            })
            
        }
        catch(err){
            return res.status(500).send({status:false,message:err.message})
        }
        }
    
const authorise = async function (req, res, next) {
    try {

        let usersId = req.decodedToken.userId
        let bodyData = req.body.userId
        let booksId = req.params.bookId

        if (bodyData) {
            if (!isValidObjectId(bodyData)) return res.status(400).send({ status: false, message: "The userId is Invalid" })
            let checkUser = await userModel.findById(bodyData)
            if (!checkUser) return res.status(400).send({ status: false, message: "UserId Not Found" })
            if (usersId != bodyData) {
                return res.status(403).send
                    ({ status: false, message: "UnAuthorized Access!!" })
            }
        }

        if (booksId) {
            if (!isValidObjectId(booksId)) return res.status(400).send({ status: false, message: "The BookId is Invalid." })
            let checkBookData = await bookModel.findOne({ _id: booksId, isDeleted: false })
            if (!checkBookData) return res.status(400).send({ status: false, message: "BookId Not Found" })
            let checkBook = await bookModel.findOne({ _id: booksId, userId: usersId })
            if (!checkBook) {
                return res.status(403).send
                    ({ status: false, message: "UnAuthorized Access!!" })
            }
        }

        next()

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { authentication, authorise }