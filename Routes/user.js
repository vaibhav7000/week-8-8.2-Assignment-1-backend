const { Router, response } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const {userSchemaValidatorSignUp, checkUserNameInDatabase, userSchemaValidatorSignIn, userExistInDatabase, authenticateUser, checkChangeFields} = require("../middlewares/user.js");
const { User, Wallet } = require("../db/database.js");

// all-user-related queriies like sigin signup change password

router.put("/", authenticateUser, checkChangeFields, async (req, res, next) => {
    const userId = req.userId;

    try {
        const response = await User.findByIdAndUpdate(userId, {
            ...req.finalUser,
        }, {
            runValidators: true, 
            new :true
        })
        
        res.status(200).json({
            msg: "Upadated successfully",
            response
        })
    } catch (error) {
        next(error);
    }
})

router.post("/userdetails", authenticateUser, async function getBalance(req, res, next) {
    const userId = req.userId;

    try {
        const resposne = await Wallet.findOne({
            userId
        })

        const balance = resposne.balance;

        req.userDetails.balance = balance;

        next();
    } catch(error) {
        next(error);
    }
} ,(req, res, next) => {
    const {firstName, lastName, balance} = req.userDetails;
    res.status(200).json({
        msg: "Authentication successfull",
        userId: req.userId,
        firstName, 
        lastName,
        balance
    })
})

router.get("/bulk", authenticateUser, async (req, res, next) => {
    const filter = req.query.filter || "";
    const userId = req.userId;

    try {   
        // this we are build a query and doing LIKE queries (just like doing on sql databases)
        const response = await User.find().or([{
            firstName: new RegExp(filter, 'i')
        }, {
            lastName: new RegExp(filter, 'i')
        }])

        // do not send user password and the current user that make the request
        const users = response.filter(user => {
            if(!user._id.equals(userId)) {
                return {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    _id: user._id
                }
            }
        })

        res.status(200).json({
            users
        })
    } catch (error) {
        next(error);
    }
})


router.post("/signup", userSchemaValidatorSignUp, checkUserNameInDatabase, async function (req, res, next) {
    // add user to database
    const finalUser = new User({
        ...req.finalUser
    })

    try {
        const response = await finalUser.save();
        // provide jwt
        const token = jwt.sign({
            userId: response._id,
            firstName: response.firstName,
            lastName: response.lastName,
        }, process.env.jwt_PASSWORD);

        // creating wallet for the given user
        try {
            const wallet = new Wallet({
                userId: response._id,
                balance: Math.floor(1 + Math.random()*9999),
            })

            const resposne2 = await wallet.save();

            res.status(201).json({
                token,
                msg: "user successfully created",
                userId: response._id,
                firstName: response.firstName,
                lastName: response.lastName,
                balance: resposne2.balance
            })
        } catch (error) {
            next(error);
        }
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