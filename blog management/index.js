const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const Connectdatabase = require("./src/dbconnections/mogoconnections");
const route = require('./src/routers/author.route')
const route1 = require('./src/routers/blog.route')

app.use(bodyParser.json());



//connect Database
Connectdatabase();

//create server
app.use('/',route);
app.use('/',route1);


app.listen(3000, () => {
  console.log('Express app running on port ' + (3000));
});

