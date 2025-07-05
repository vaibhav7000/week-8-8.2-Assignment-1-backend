const mongoose = require("mongoose");

async function connectionWithDatabase() {
    try {
        const connectionResponse = await mongoose.connect(process.env.db_URL);
        console.log("connection with database is successfull");

        return true;
    } catch (error) {
        throw error;
    }
}

// we have added contraints so that if one of the following fails mongoDB / mongoose will not add data in the corresponding collection and throw error
const userSchema = new mongoose.Schema({
    // username is email
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    firstName: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
        maxLength: 50
    }, 
    password: {
        type: String,
        required: true,
        trim: true, 
        maxLength: 50
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId, // if end user does not send a valid userId than we will not able to add / update balance for the user (it ensures that this userId should exist ins User collection)
        ref: 'User',
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    }
})

const Wallet = mongoose.model('Wallet', walletSchema);

// in payment application we does not store balance as float. It will stored as Integers ( make issues both with js and database ). Like if the balance is 88.88 - it will be stored as 8888 and somehow converts / recoganizes that 88.88, if we have actual 8888 as balance we will store that as 888800 (this example takes 2 decimal places)
// we store the number of precisions for the balances 

module.exports = {
    connectionWithDatabase, User, Wallet

}