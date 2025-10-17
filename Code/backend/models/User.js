const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 255
    },
    username: {
        type: String,
        required: true,
        unique: true,
        maxlength: 255
    },
    password_hash: {
        type: String,
        required: true
    },
    public_key: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    last_seen_at: {
        type: Date,
        default: Date.now
    },
    is_active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('User', userSchema);