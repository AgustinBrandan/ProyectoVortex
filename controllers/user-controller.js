const HttpError = require("../models/http.error");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { transporter } = require("./../utils/mailer");
const crypto = require("crypto");
const { generateUniqueToken } = require("./../utils/generateToken");

// Model
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Página actual (predeterminada: 1)
  const limit = parseInt(req.query.limit) || 10; // Límite de usuarios por página (predeterminado: 10)

  try {
    const users = await User.find({}, "-password")
      .skip((page - 1) * limit) // Salta los usuarios según la página y el límite
      .limit(limit);

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
      new HttpError(
        "No se pudo verificar el usuario existente. Intente mas tarde",
        500
      )
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
    token = await newUser.generateAuthToken();
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
    const existingUser = await User.findByCredentials(email, password);

    const token = await existingUser.generateAuthToken();

    res.json({ userId: existingUser.id, email: existingUser.email, token });
  } catch (err) {
    console.log(err);
    next(new HttpError("No se pudo iniciar sesión, inténtalo de nuevo", 500));
  }
};

const sendRecoveryEmail = async (req, res, next) => {
  // Validacion de datos
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(422).json({ errors: errorMessages });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new HttpError("Usuario no encontrado", 404));
    }

    const token = generateUniqueToken();
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // Tiempo de expiración de 1 hora

    await user.save();

    const resetLink = `http://localhost:5000/api/user/reset-password/${token}`; // URL de tu ruta de restablecimiento de contraseña

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Recuperación de Contraseña",
      html: `<p>Hola ${user.name},</p><p>Has solicitado restablecer tu contraseña. Puedes hacerlo <a href="${resetLink}">aquí</a> usando el token: ${token}.</p><p>Si no has solicitado este cambio, puedes ignorar este correo.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return next(new HttpError("Error al enviar el correo", 500));
      } else {
        res.json({
          message:
            "Correo electrónico enviado para la recuperación de contraseña",
        });
      }
    });
  } catch (err) {
    console.log(err);
    next(
      new HttpError("Error al solicitar la recuperación de contraseña", 500)
    );
  }
};

const resetPassword = async (req, res, next) => {
  // Validacion de datos
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(422).json({ errors: errorMessages });
  }

  const token = req.params.token;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return next(new HttpError("Token inválido o expirado", 400));
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(newPassword, 12);
    } catch (err) {
      return next(
        new HttpError(
          "No se pudo cambiar la contraseña, intentelo de nuevo",
          500
        )
      );
    }

    // Hashear y guardar la nueva contraseña
    user.password = hashedPassword;

    // Limpiar los campos de resetToken
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    next(new HttpError("Error al actualizar la contraseña", 500));
  }
};

module.exports = {
  getUsers,
  signup,
  login,
  sendRecoveryEmail,
  resetPassword,
};
