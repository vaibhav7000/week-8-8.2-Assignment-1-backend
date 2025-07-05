const { transferValidation } = require("../utils/validators");


function transcationValidator(req, res, next) {
    const result = transferValidation.safeParse({
        ...req.body
    })


    if(!result.success) {
        res.status(400).json({
            msg: "Invalid input"
        })
        return
    }

    next();
}

module.exports = {
    transcationValidator
}