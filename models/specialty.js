const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const specialtySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true }
});

specialtySchema.plugin(uniqueValidator);

module.exports = mongoose.model("Specialty", specialtySchema);
