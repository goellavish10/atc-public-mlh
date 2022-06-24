const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    SUBURB: {
        type: String,
    },
    PCODE: {
        type: Number,
    }
});

addressSchema.index({ SUBURB: 'text' });

module.exports = Addresse = mongoose.model("addresse", addressSchema);