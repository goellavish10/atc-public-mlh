const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    authCode: {
        type: String,
        required: true,
    },
    otpCode: {
        type: String,
    },
    bookingHistory: [{
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
        }
    }],
    savedAddresses: [
        {
            businessName: {
                type: String,
            },
            address: {
                type: String,
            },
            postcode: {
                type: String,
            }
        }
    ],
    isVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    stripeCusId: {
        type: String,
    },
    passResetAuthCode: {
        type: String,
    }
}, { timestamps: true });

module.exports = User = mongoose.model('user', userSchema);