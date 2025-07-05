const { Router } = require("express");
const router = Router();
const userRouter = require("./user.js");


router.use("/user", userRouter);


module.exports = Router;