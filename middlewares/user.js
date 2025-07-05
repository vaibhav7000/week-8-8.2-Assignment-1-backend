const { User } = require("../db/database.js");
const {userValidatorSignUp, userValidatorSignIn} =  require("../utils/validators.js");

function userSchemaValidatorSignUp(req, res, next) {
    const result = userValidatorSignUp.safeParse({
        ...req.body
    })

    console.log(result);

    if(!result.success) {
        res.status(400).json({
            issues: result.error.issues
        })
        return
    }

    req.finalUser = result.data;
    next();
}

async function checkUserNameInDatabase(req, res, next) {
    const {username} = req.finalUser;
    try {
        const response = await User.findOne({
            username
        })

        if(response) {
            res.status(411).json({
                msg: "Email with username already exist"
            })
            return
        }
        next();
    } catch (error) {
        next(error);
    }
}

function userSchemaValidatorSignIn(req, res, next) {
    const result = userValidatorSignIn.safeParse({
        ...req.body
    })

    if(!result.success) {
        res.status(411).json({
            issues: result.error.issues
        })
        return
    }

    req.finalUser = result.data;

    next();
}

async function userExistInDatabase(req, res, next) {
    const {username, password} = req.finalUser;

    try {
        const response = await User.findOne({
            username, password
        })

        if(!response) {
            res.status(411).json({
                msg: "user does not exist with this username / Error while logging in"
            })
        }
        req.userId = response._id;

        next();
    } catch (error) {
        next(error)
    }
}


module.exports = {
    userSchemaValidatorSignUp, checkUserNameInDatabase, userSchemaValidatorSignIn, userExistInDatabase
}