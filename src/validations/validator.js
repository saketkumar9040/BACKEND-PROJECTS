const mongoose = require('mongoose')

const isValid =(value) => {
    if (typeof value === 'undefined' || value === null) return false //it checks whether the value is null or undefined.
    if (typeof value === 'string' && value.trim().length === 0) return false //it checks whether the string contain only space or not 
    return true;
};
const isValidTitle=(title)=>{
    if(/^[a-zA-Z]+(([',. -][a-zA-Z0-9 ])?[a-zA-Z0-9]*)*$/.test(title))
    return true
}
const isValidEmail=(mail)=>{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    return true
}
const isValidBody=(body)=>{
    if(/^[a-zA-Z]+(([',. -][a-zA-Z0-9 ])?[a-zA-Z0-9]*)*$/.test(body))
    return true
}
const isValidPassword=(pw)=>{
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,15}$/.test(pw))
    return true
}
const isValidName=(name)=>{
    if(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(name))
    return true
}
const isValidObjectId =(objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const isValidISBN =(isbn) => {
    if(/^[0-9]{13}$/.test(isbn))
    return true
}
const isValidReview =(review) => {
    if(/^[0-5]{1}$/.test(isbn))
    return true
}
const isValidDate =(date) => {
    if(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/)
    return true
}


module.exports={isValid,isValidBody,isValidObjectId, isValidTitle, isValidPassword, isValidName, isValidEmail, isValidISBN, isValidReview, isValidDate}