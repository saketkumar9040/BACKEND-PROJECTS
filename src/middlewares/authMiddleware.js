const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel")
const { isValidObjectId } = require("../validations/validator")


const authenticate = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if (!token) token = req.headers["X-api-key"];
        if (!token) return res.status(400).send({ status: false, msg: "token must be present" });
        console.log(token);
        let decodedToken = jwt.verify(token, 'DFGHJK34567890--85643ytfhgjkl', function (err, decoded) {
            if (err) {
                console.log(err.message)
            } else return decoded
        });
        console.log(decodedToken)


        if (!decodedToken) {
            return res.status(400).send({ status: false, msg: "Invalid authentication token in request" });
        }
        req["userId"] = decodedToken.userId;
        next()
    }
    catch (err) {
        res.status(500).send({ Status: false, mgs: err.message })
    }
}

const authorise = async function (req, res, next) {
    try {
        let bookId = req.params.bookId

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: `no such as an _id:${bookId} found` })
        }
        let findAuthorId = await bookModel.findById(bookId)
        let userId = findAuthorId.userId
        let token = (req.headers["x-api-key"]);

        if (!token) {
            return res.status(403).send({ status: false, message: "Missing authentication token in request" });
        }
        let decodedToken = jwt.verify(token, "DFGHJK34567890--85643ytfhgjkl", function (err, decoded) {
            if (err) {
                console.log(err.message)
            } else return decoded
        });
        console.log(decodedToken)


        if (!decodedToken) {
            return res.status(400).send({ status: false, msg: "Invalid authentication token in request" });
        }
        req["userId"] = decodedToken.userId;
        let tokenauthorId = decodedToken.userId
        if (tokenauthorId != userId) return res.status(403).send({ Status: false, msg: "You Can't Access It" })
        next();
    }

    catch (error) {
        console.error(`Error! ${error.message}`)
        res.status(500).send({ status: false, message: error.message });
    }
}
module.exports = { authenticate, authorise }