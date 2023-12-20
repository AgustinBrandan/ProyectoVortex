const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
  name: { type: String, required: true },
  specialty: { type: Schema.Types.ObjectId, ref: "Specialty", required: true },
  appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
});

module.exports = mongoose.model("Doctor", doctorSchema);
