const express = require('express');
const authRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds = 10;

authRouter.post('/login', (req, res, next) => {
    bcrypt.compare(req.body.accessKey, process.env.ACCESS_KEY, (err, isMatch) => {
        if(err) {
            res.status(500)
            return next(new Error("Server error."))
        }
        if(isMatch) {
            const token = jwt.sign({}, process.env.ACCESS_KEY)
            res.status(200).send({token})
            return;
        }
        res.status(403)
        return next(new Error("Access key is incorrect."))
    })
    // if(req.body.accessKey === process.env.ACCESS_KEY) {
    //     const token = jwt.sign({}, process.env.USER_SECRET);
    //     res.status(200).send({token})
    // } else {
    //     res.status(403)
    //     return next(new Error("Incorrect access key."))
    // }
})

module.exports = authRouter;