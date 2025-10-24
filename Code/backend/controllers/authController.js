const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const User = require('../models/User');
const { generateTokenAndCookie } = require('../utils/tokenUtils');

exports.signup = async (req, res) => {
  try{
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords don't match" });
		}

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser){
      return res.status(400).json({
        success: false,
        message: "Nome utente già in uso"
      })
    }

    const salt = await bcrypt.genSalt(10);

    hashedPassword = await bcrypt.hash(password, salt);
    const public_key = "dummy_public_key_" + username;
    const uuid = nanoid();
    const user = new User({ uuid, username, email, password: hashedPassword, public_key});
    
    if(user){
      
      generateTokenAndCookie(user.uuid, res);
      await user.save();

      res.status(201).json({
        success: true,
        message: "Utente registrato",
        utente: user.username,
        password: user.password,
        creato: user.created_at
      });

    } else {
      res.status(400).json({ error: "Invalid user data" });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).send('Errore del server');
  }
};

exports.login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndCookie(user.uuid, res);

		res.status(200).json({
			uuid: user.uuid,
      username: user.username,
      email: user.email
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

exports.logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};