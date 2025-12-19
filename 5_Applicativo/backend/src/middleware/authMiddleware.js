import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Non autorizzato - Nessun Token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Non autorizzato - Token non valido" });
    }
    const user = await User.findById(decoded.userId).select("-password -privateKey");

    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Errore nel middleware: ", error.message);
    res.status(500).json({ message: "Errore interno del server" });
  }
};
