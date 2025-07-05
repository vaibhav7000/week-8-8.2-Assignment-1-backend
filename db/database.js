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
        minLength: 8
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
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

module.exports = {
    connectionWithDatabase,

}