const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "QunuChinNgoc";

exports.signup = (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: true, message: "Please fill in all fields!" });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ error: true, message: "Passwords do not match!" });
  }
  // User.createByGoogle( (err, user) => {
  //   return (
  //     <div>
  //       <GoogleLogin
  //       onSuccess = {(credialResponse) => {
  //         console.log (credialResponse);
  //       }}
  //       onError={() => {
  //         console.log ("Login Failed");
  //       }}
  //       />
  //     </div>
  //   )
  // })

  User.findByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: "Database error",
      });
    }

    if (user) {
      return res.status(400).json({
        error: true,
        message: "Email already exists!",
      });
    }

    // Hash password
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({
          error: true,
          message: "Password encryption failed",
        });
      }

      // Create new user
      const userData = {
        name: username,
        email: email,
        password: hashedPassword,
        // password: password,
      };

      User.create(userData, (err, result) => {
        if (err) {
          return res.status(500).json({
            error: true,
            message: "Error when creating account!",
          });
        }

        console.log("Signup successful!");
        res.status(201).json({
          success: true,
          message: "Signup successful!",
        });
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Please fill in all fields!" });
  }

  User.findByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: "Database error",
      });
    }
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({
          error: true,
          message: "Error comparing passwords",
        });
      }

      if (!isMatch) {
        return res.status(401).json({
          error: true,
          message: "Incorrect password",
        });
      }

      // Direct password comparison instead of using bcrypt
      // if (password !== user.password) {
      //   return res.status(401).json({
      //     error: true,
      //     message: "Incorrect password",
      //   });
      // }

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: "1h",
      });
      // Log in successfully, might need JWT token later nhe Qunu
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          photoPath: user.photoPath,
          initials: user.initials,
        },
        token,
      });
    });
  });
};
