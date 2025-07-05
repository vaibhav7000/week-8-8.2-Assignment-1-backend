const z = require("zod");

const userValidatorSignUp = z.object({
    username: z.string().trim().email(),
    firstName: z.string().trim().min(8).max(50),
    lastName: z.string().trim().min(8).max(50),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
})

const userValidatorSignIn = z.object({
    username: z.string().trim().email(),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
})


module.exports = {
    userValidatorSignUp, userValidatorSignIn
}