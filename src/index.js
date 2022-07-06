const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const route = require('./routes/route')
const { urlencoded } = require('express')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))

mongoose.connect('mongodb+srv://sahilkushwaha:aasahil@cluster0.jluapfr.mongodb.net/group67Database?retryWrites=true&w=majority',
{useNewUrlParser : true})
.then(()=>console.log('MongoDB is connected'))
.catch((err)=>console.log(err.message))

app.use('/',route)

app.listen(process.env.PORT || 3000,()=>{
    console.log("Express app running on port" +(process.env.PORT || 3000) )
}
)