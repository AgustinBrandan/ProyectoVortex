const HttpError = require("../models/http.error");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Model
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password");
    res.json({ users });
  } catch (err) {
    return next(new HttpError("No se pudieron obtener los usuarios", 500));
  }
};

const signup = async (req, res, next) => {
  // Validacion de datos
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(422).json({ errors: errorMessages });
  }

  const { name, email, password, role } = User(req.body);

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("No se pudo verificar el usuario existente", 500)
    );
  }

  if (existingUser) {
    return next(
      new HttpError("El usuario ya existe, por favor inicia sesión", 422)
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(
      new HttpError("No se pudo crear usuario, intentelo de nuevo", 500)
    );
  }

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role,
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(
      new HttpError("No se pudo crear el usuario, inténtalo de nuevo", 500)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(
      new HttpError("No se pudo iniciar sesión, inténtalo de nuevo", 500)
    );
  }

  res
    .status(201)
    .json({ userId: newUser.id, email: newUser.email, token: token });
};

const login = async (req, res, next) => {
    // Validacion de datos
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(422).json({ errors: errorMessages });
    }
    
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(new HttpError("Este usuario no existe", 403));
    }

    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isValidPassword) {
      return next(new HttpError("Credenciales incorrectas", 403));
    }

    const token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.json({ userId: existingUser.id, email: existingUser.email, token });
  } catch (err) {
    next(new HttpError("No se pudo iniciar sesión, inténtalo de nuevo", 500));
  }
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
