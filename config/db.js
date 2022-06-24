const mongoose = require('mongoose');

module.exports.connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI, (err, db) => {
            if (err) return err;
            console.log('MongoDB Connected....');
        });
    } catch (err) {
        console.log(err);
    }
}