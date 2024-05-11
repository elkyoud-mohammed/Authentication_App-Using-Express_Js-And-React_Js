const mongoose = require("mongoose");
const conncetDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
    } catch (erreur) {
        console.log(erreur);
    }
};

module.exports = conncetDB;