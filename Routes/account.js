const {Router} = require("express");
const { authenticateUser } = require("../middlewares/user");
const { Wallet, User } = require("../db/database");
const { transcationValidator } = require("../middlewares/account");
const { default: mongoose } = require("mongoose");
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


router.post("/transfer", authenticateUser, transcationValidator, async (req, res, next) => {
    const userId = req.userId;
    const { amount, sendTo } = req.body;

    if(!mongoose.isValidObjectId(sendTo)) {
        res.status(400).json({
            msg: "Invalid sender"
        })
        return
    }

    let session = null;

    try {
        // create a transaction
        session = await mongoose.startSession();

        // all the transaction (set of operation will be present inside the single try catch block)
        try {
            session.startTransaction();
            // now all the operations either will be full done / commited or none of them will work (rolled back if error occur)
            const sender = await Wallet.findOne({
                userId
            }).session(session);

            if(!sender) {
                throw new Error("Sender does not exist");
            }

            if(sender.amount < amount) {
                throw new Error("Insufficient Balance");
            }

            const reciever = await Wallet.findOne({
                userId: sendTo
            }).session(session);

            if(!reciever) {
                throw new Error("Reciever does not exist")
            }

            // if we make any changes locally to the document that we recieve during a session we can directly update that to the collection
            sender.balance -= amount;
            reciever.balance += amount;

            const response = await sender.save({
                session
            });

            console.log(response);
            await reciever.save({
                session
            });

            await session.commitTransaction();

            await session.endSession();

            res.status(200).json({
                msg: "Transaction completed"
            })

        } catch (error) {
            // rolling all the previous set of operations / releasing the data to be accessable for other transaction
            try {
                await session.abortTransaction(); // all the previous will be rolled back

                res.status(500).json({
                    msg: error.message
                })

            } catch (err) {
                res.status(500).json({
                    msg: "Transaction failed. Internal server error"
                })
            }

            session.endSession();
        }
    } catch (error) {
        session.endSession();
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