import { generateToken } from "../config/tokenUtils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateKeyPairSync } from "crypto";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tutti i campi devono essere riempiti" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "La password deve essere lunga almeno 6 caratteri" });
    }

    const existingUser = await User.findOne({$or: [{ email }, { username }]});
    if (existingUser){
      return res.status(400).json({ message: "Nome utente o email già in uso" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let keys = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: password
      }
    });

    const user = new User({
      username: username,
      email,
      password: hashedPassword,
      privateKey: keys.privateKey,
      publicKey: keys.publicKey
    });

    if (user) {
      await user.save();

      console.log("Utente salvato con successo:", user._id);
      generateToken(user._id, res);

      res.status(201).json({
        message: "Utente registrato",
        _id: user._id,
        username: user.username,
        email: user.email
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Errore interno del server" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Credenziali non valide" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Credenziali non valide" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      publicKey: user.publicKey
    });
  } catch (error) {
    console.log("Errore nel login controller", error.message);
    res.status(500).json({ message: "Errore interno del server" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout effettuato con successo!" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Errore interno del server" });
  }

};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Errore nel checkAut controller", error.message);
    res.status(500).json({ message: "Errore interno del server" });
  }
};
