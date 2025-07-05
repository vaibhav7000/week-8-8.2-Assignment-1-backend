const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const {userSchemaValidatorSignUp, checkUserNameInDatabase, userSchemaValidatorSignIn, userExistInDatabase} = require("../middlewares/user.js");
const { User } = require("../db/database.js");

// all-user-related queriies like sigin signup change password


router.post("/signup", userSchemaValidatorSignUp, checkUserNameInDatabase, async function (req, res, next) {
    // add user to database
    const finalUser = new User({
        ...req.finalUser
    })

    try {
        const response = await finalUser.save();
        // provide jwt
        const token = jwt.sign({
            userId: response._id
        }, process.env.jwt_PASSWORD);

        res.status(201).json({
            token,
            msg: "user successfully created"
        })
    } catch (error) {
        next(error);
    }
})


router.post("/signin", userSchemaValidatorSignIn, userExistInDatabase, (req, res, next) => {
    const token = jwt.sign({
        userId: req.userId
    })

    res.status(200).json({
        token,
        msg: "User is logged In"
    })
})

module.exports = router