require("dotenv").config();
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const joi = require('joi');
const socketIo = require("socket.io");
const connectDB = require('./config/db');
const authRoutes = require("./routes/authRoute");
const messagesRoute = require("./routes/messagesRoute");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoute);

connectDB();

app.get("/", (req, res) => {
  res.json({message:"ciao"})
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Il server funziona sulla porta ${PORT}`);
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/chat", function (req, res) {
  res.render("chat");
});