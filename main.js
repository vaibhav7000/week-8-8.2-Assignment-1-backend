require("dotenv").config();
const express = require("express");
const { connectionWithDatabase } = require("./db/database");
const mainRouter = require("./Routes/main-router.js");
const cors = require("cors");


const app = express();

app.use(cors({
    origin: "*"
}))


app.use(express.json());


app.use("/api/v1" , mainRouter);

// connection iife
(async () => {
    try {
        const response = await connectionWithDatabase(); // true;
        app.listen(process.env.PORT, function() {
            console.log("server is up")
        })
    } catch (error) {
        console.log("switching off the server");
        process.exit(1);
    }
})();


// global catch
app.use(function(error, req, res, next) {
    if(error) {
        res.status(500).json({
            msg: "Interval server error"
        })
        return
    }

    next();
})  

app.use(function(req, res, next) {
    res.status(404).json({
        msg: "Route does not exist"
    })
})