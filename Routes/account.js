const {Router} = require("express");
const { authenticateUser } = require("../middlewares/user");
const { Wallet } = require("../db/database");
const router = Router();

router.get("/balance", authenticateUser, async (req, res, next) => {
    const userId = req.userId;
    try {
        const response = await Wallet.findOne({
            userId: userId
        })

        res.status(200).json({
            balance: response.balance
        })
    } catch (error) {
        next(error);
    }
})


module.exports = router;


/*
    What Does Isolation Mean?
    Isolation means that:
    Even if multiple transactions are running at the same time (concurrently), each one behaves as if it’s the only one running.

    So, no transaction sees half-completed changes made by another. This prevents race conditions, dirty reads, non-repeatable reads, and phantom reads (depending on the isolation level — more below).
    
*/