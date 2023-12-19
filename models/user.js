const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true, minlength: 6 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  resetToken: { type: String }, // Token para restablecer la contraseña
  resetTokenExpiration: { type: Date }, // Tiempo de expiración del token
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
