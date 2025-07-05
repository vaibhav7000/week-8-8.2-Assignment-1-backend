const { User } = require("../db/database.js");
const jwt = require("jsonwebtoken");
const {userValidatorSignUp, userValidatorSignIn, userValidatorOptional} =  require("../utils/validators.js");

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

function checkChangeFields(req, res, next) {
    const result = userValidatorOptional.safeParse({
        ...req.body,
    })

    if(!result.success) {
        res.status(403).json({
            msg: "Something up with your changing fields",
            issues: result.error.issues
        })
        return
    }

    req.finalUser = result.data;
    next()
}

// this middleware is used to authenticate routes which require a valid user to access the functionality
async function authenticateUser(req, res, next) {
    const authHeader = req.headers["Authorization"];

    if(!authHeader || authHeader.startsWith("Bearer ")) {
        res.status(403).json({
            msg: "Not authenticated to access the route"
        })
        return;
    }

    const token = authHeader.split(' ')[1];

    if(!token) {
        res.status(403).json({
            msg: "Not authenticated to access the route"
        })
        return
    }

    try {
        // validate the jwt token
        const decodeToken = jwt.verify(token,process.env.jwt_PASSWORD);

        if(!decodeToken.userId) {
            res.status(403).json({
                msg: "Invalid token"
            })
            return;
        }
        req.userId = decodeToken.userId;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(403).json({
                msg: "Token has expired"
            });
        } else if (error.name === 'JsonWebTokenError') {
            res.status(403).json({
                msg: "Invalid token"
            });
        } else {
            res.status(403).json({
                msg: error.message,
            });
        }
    }
}


module.exports = {
    userSchemaValidatorSignUp, checkUserNameInDatabase, userSchemaValidatorSignIn, userExistInDatabase, authenticateUser, checkChangeFields
}