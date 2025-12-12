import Message from "../models/Message.js";
import User from "../models/User.js";
import * as crypto from "node:crypto";

import { getReceiverSocketId, io } from "../config/socket.js";
import {decryptMessage, decryptPrivateKey, encryptMessage} from "../config/cryptoUtils.js";

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
    let encryptedImage = null;


    if (text) {
      encryptedText = await encryptMessage(receiverId, text);
    }

    /*if (image){
      encryptedImage = await encryptImage(receiverId, image);
    }*/

    const newMessage = new Message({
      senderId,
      receiverId,
      text: encryptedText,
      image
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

// Restituisce i messaggi decifrati tra l'utente loggato e l'utente indicato
export const getDecryptedMessages = async (req, res) => {
  try {
    const { password } = req.body;
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!password) {
      return res.status(400).json({ error: "Password mancante per la decifratura" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    const decryptedMessages = [];

    for (const msg of messages) {
      let decryptedText = "";

      if (msg.text) {
        try {
          const buffer = await decryptMessage(myId, password, msg.text);
          decryptedText = buffer.toString("utf8");
        } catch (error) {
          console.error("Impossibile decifrare un messaggio:", error);
        }
      }

      decryptedMessages.push({
        ...msg.toObject(),
        decryptedText,
      });
    }

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Error in getDecryptedMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};