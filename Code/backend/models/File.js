const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  message_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  filename: {
    type: String,
    required: true,
    maxlength: 255
  },
  file_data: {
    type: Buffer,
    required: true
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('File', fileSchema);