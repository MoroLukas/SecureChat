import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    // copia cifrata per il mittente, in modo da poterla rileggere dopo refresh
    senderCopy: {
      type: String,
    },
    // immagine cifrata (può essere oggetto ibrido)
    image: {
      type: mongoose.Schema.Types.Mixed,
    },
    // copia cifrata dell'immagine per il mittente
    senderImageCopy: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
