const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken')
const { isValid, isValidBody, isValidPassword, isValidName, isValidEmail} = require("../validations/validator")

/**************************************************Create User API**************************************************/
const createUser = async function (req, res) {
    try {
        let data = req.body
        if(!Object.keys(data).length)return res.status(400).send({ status: false, message: 'Please Enter The  User Details' })
        const { title, name, phone, email, password } = data


        //if (!isValid(data)) return res.status(400).send({ status: false, message: 'Please Enter The  User Details' })

        if (!isValid(title))
            return res.status(400).send({ status: false, message: 'Title Is Required' })

        if (["Mr", "Mrs", "Miss"].indexOf(title) == -1) { return res.status(400).send({ status: false, message: "Enter a valid Title (e.g- Mr or Mrs or Miss)", }); }

        if (!isValid(name)) return res.status(400).send({ status: false, message: 'Name Is Required' })
        if (!isValidName(name)) return res.status(400).send({ status: false, message: "Please Enter A Valid User Name" })

        if (!isValid(phone)) return res.status(400).send({ status: false, message: 'Phone Is Required' })
        if (!(/^(\+\d{1,3}[- ]?)?\d{10}$/).test(phone)) { return res.status(400).send({ status: false, message: `${phone} is Not a Valid Mobile Number ` }) }
        
        const checkPhone = await userModel.findOne({ phone: phone });
        if (checkPhone) return res.status(400).send({ status: false, message: `Phone Is Already Registered` })

        if (!isValid(email)) return res.status(400).send({ status: false, message: 'Email Is Required' })
        if (!isValidEmail(email)) { return res.status(400).send({ status: false, message: 'Email should be Valid Email Address' }) }

        const checkEmail = await userModel.findOne({ email: email });
        if (checkEmail) return res.status(400).send({ status: false, message: `Email Address is Already Registered` })

        if (!isValid(password)) return res.status(400).send({ status: false, message: 'Password is Required' })
        if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "Password must contains 1 upperCaseletter 1 lowerCaseLetter 1 special character and  Total Character should  be 8 to 15" }) }
        
        if(data.address){
            if(data.address.street){
            if(!isValid(data.address.street)) return res.status(400).send({status:false,message:"Do not leave blank address"})
            }
            if(data.address.city){
            if (!isValidBody(data.address.city))return res.status(400).send({ status: false, message: 'Address Of city is Invalid' })
            if(!isValid(data.address.city)) return res.status(400).send({status:false,message:"Do not leave blank City address"})
            
        }
          
            if(data.address.pincode){
            if (!(/^[1-9]{1}[0-9]{5}$/).test(data.address.pincode))
                return res.status(400).send({ status: false, message: 'Address Of pincode is Invalid' })
            }
    }

        const newUser = await userModel.create(data);
        res.status(201).send({ status: true, message: 'Success', data: newUser });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
/**************************************************User Login API**************************************************/


const loginUser = async function (req, res) {
    try {

        let data = req.body
        if(Object.keys(data).length===0)return res.status(400).send({ status: false, message: "Please Provide Login Details" })
        const { password, email } = data

        if (!isValid(email)) return res.status(400).send({ status: false, message: 'Email is Required' })
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: 'Email Should Be Valid Email Address' })
        }

        if (!isValid(password)) return res.status(400).send({ status: false, message: 'Password is Required' })
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password must contains 1 upperCaseletter 1 lowerCaseLetter 1 special character and  Total Character should  be 8 to 15" })
        }
        const user = await userModel.findOne({ email: email, password: password })
        if (!user) return res.status(401).send({ status: false, message: 'Invalid Login Credentials' });


        const token = jwt.sign({userId: user._id, }, 'DFGHJK34567890--85643ytfhgjkl',{expiresIn:"30s"})

        res.setHeader('x-api-key',token)

        res.status(200).send({ status: true, message: "Success", data: token });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createUser, loginUser }