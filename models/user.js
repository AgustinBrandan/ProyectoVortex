const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true, minlength: 6 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  resetToken: { type: String }, // Token para restablecer la contraseña
  resetTokenExpiration: { type: Date }, // Tiempo de expiración del token
});

// Generar Token
userSchema.methods.generateAuthToken = function () {
  const user = this;

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_KEY,
    { expiresIn: "1h" }
  );

  return token;
};

// Buscar Credenciales
userSchema.statics.findByCredentials = async function (email, password) {
  const User = this;
  // Busca un usuario por su correo electrónico
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    // throw new Error("Este usuario no existe");
    return { error: "Este usuario no existe" };
  }

  const isValidPassword = await bcrypt.compare(password, existingUser.password);
  if (!isValidPassword) {
    // throw new Error("Credenciales incorrectas");
    return { error: "Credenciales incorrectas" };
  }
  return existingUser;
};

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
