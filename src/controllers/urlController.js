const validUrl = require("valid-url");
const shortId = require("shortid");
const urlModel = require("../models/urlModel");
const redis = require("redis");
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    10398,
    "redis-10398.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("hvbyvcPuFpChZ3M8cozmFILuUwv4ZMWG", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////  CREATE URL API  ////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

const urlRegex = (value) => {
    let urlRegex = /^(?:(?:(?:https?|http):)?\/\/.*\.(?:png|gif|webp|com|in|org|co|co.in|net|jpeg|jpg))/i;
    if (urlRegex.test(value))
        return true;
}

const createUrl = async (req, res) => {
    try {
        let data = req.body

        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Body is empty!" })

        const longUrl = req.body.longUrl

        if (!urlRegex(longUrl)) return res.status(400).send({ status: false, message: "Either the url key or the url entered is incorrect!" })

        let cache = await GET_ASYNC(`${req.body.longUrl}`)
        cache = JSON.parse(cache)
        if (cache) { return res.status(200).send({ status: true, cacheData: cache }) }

        else {
            let uniqueUrl = await urlModel.findOne({ longUrl }).select({ __v: 0, createdAt: 0, updatedAt: 0, _id: 0 })
            if (uniqueUrl) return res.status(200).send({ status: true, data: uniqueUrl })

            let urlCode = shortId.generate().toLocaleLowerCase();
            let shortUrlCode = "http://localhost:3000/" + urlCode
            data.urlCode = urlCode
            data.shortUrl = shortUrlCode
            data.longUrl = longUrl

            let urlCreation = await urlModel.create(data)
            await SET_ASYNC(`${longUrl}`, JSON.stringify(data))
            return res.status(201).send({ status: true, data: data })
        }

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////  GET URL API  ///////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

const getUrl = async (req, res) => {
    try {
        const urlCode = req.params.urlCode
        if (!shortId.isValid(urlCode)) return res.status(400).send({ status: false, message: "Invalid URL!" })

        let cache = await GET_ASYNC(`${req.params.urlCode}`)
        cache = JSON.parse(cache)
        if (cache) return res.status(302).redirect(cache.longUrl)

        const findUrl = await urlModel.findOne({ urlCode })
        if (!findUrl) return res.status(400).send({ status: false, message: "Url not found!" })

        await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(findUrl))
        return res.status(302).redirect(findUrl.longUrl)

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createUrl, getUrl }