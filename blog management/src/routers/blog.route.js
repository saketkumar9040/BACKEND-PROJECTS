const express = require("express");
const router= express.Router();
const {authorAuth} =require('../middleware/middleware')

const {blogdata,blogUpdate,delblog,delbyquery,getBlog}= require('../controllers/blog.controllers');

router.route('/blogs').post(authorAuth,blogdata);

router.route('/blogs').get(authorAuth,getBlog)

router.route('/blogs/:blogId').put(authorAuth,blogUpdate)

router.route('/blogs/:blogId').delete(authorAuth,delblog)

router.route('/blogs').delete(authorAuth,delbyquery)

module.exports = router;