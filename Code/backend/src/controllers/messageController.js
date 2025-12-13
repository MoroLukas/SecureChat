import Message from "../models/Message.js";
import User from "../models/User.js";
import * as crypto from "node:crypto";

import { getReceiverSocketId, io } from "../config/socket.js";
import {
  decryptMessageWithPrivateKey,
  decryptPrivateKey,
  encryptMessage,
  encryptImage,
  decryptImage,
} from "../config/cryptoUtils.js";

export const getContactUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const receiver = await User.findById(receiverId).select('publicKey');
    if (!receiver || !receiver.publicKey) {
      return res.status(400).json({ error: "Chiave del destinatario assente" });
    }

    let encryptedText = '';
    let senderCopy = '';
    let encryptedImage = null;
    let senderImageCopy = null;


    if (text) {
      encryptedText = await encryptMessage(receiverId, text);
      // copia cifrata anche per il mittente, così può rileggere dopo refresh
      senderCopy = await encryptMessage(senderId, text);
    }

    if (image){
      encryptedImage = await encryptImage(receiverId, image);
      senderImageCopy = await encryptImage(senderId, image);
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: encryptedText,
      senderCopy,
      image: encryptedImage,
      senderImageCopy
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDecryptedMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { password } = req.body;
    const myId = req.user._id;

    if (!password) {
      return res.status(400).json({ error: "Password required to decrypt messages" });
    }

    const user = await User.findById(myId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let decryptedPrivateKey;
    try {
      decryptedPrivateKey = decryptPrivateKey(user.privateKey, password);
    } catch (error) {
      return res.status(400).json({ error: "Wrong password. Cannot decrypt private key." });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    const decryptedMessages = await Promise.all(
        messages.map(async (msg) => {
          const messageObj = msg.toObject();

          const isReceiver = messageObj.receiverId.toString() === myId.toString();
          const isSender = messageObj.senderId.toString() === myId.toString();

          // Messaggi ricevuti: decifra testo e immagine
          if (isReceiver) {
            let text = messageObj.text;
            let image = messageObj.image;

            if (messageObj.text) {
              try {
                text = decryptMessageWithPrivateKey(decryptedPrivateKey, messageObj.text);
              } catch (decryptError) {
                console.error("Failed to decrypt message:", decryptError);
                text = "[Messaggio cifrato - decifratura fallita]";
              }
            }

            if (messageObj.image) {
              try {
                image = await decryptImage(myId, password, messageObj.image);
              } catch (decryptError) {
                console.error("Failed to decrypt image:", decryptError);
                image = null;
              }
            }

            return {
              ...messageObj,
              text,
              image,
              isDecrypted: true
            };
          }

          // Messaggi che ho inviato io: decifra copia di testo e immagine, se esistono
          if (isSender) {
            let text = messageObj.text;
            let image = messageObj.image;

            if (messageObj.senderCopy) {
              try {
                text = decryptMessageWithPrivateKey(decryptedPrivateKey, messageObj.senderCopy);
              } catch (decryptError) {
                console.error("Failed to decrypt sender copy:", decryptError);
              }
            }

            if (messageObj.senderImageCopy) {
              try {
                image = await decryptImage(myId, password, messageObj.senderImageCopy);
              } catch (decryptError) {
                console.error("Failed to decrypt sender image copy:", decryptError);
              }
            }

            return {
              ...messageObj,
              text,
              image,
              isDecrypted: true,
              isSentByMe: true
            };
          }

          // Altri casi
          return {
            ...messageObj,
            isDecrypted: false
          };
        })
    );

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log("Error in getDecryptedMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};