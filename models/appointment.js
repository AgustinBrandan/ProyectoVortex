const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  dateTime: {
    type: Date,
    required: true
  },
  hour: { type: String, required: true },
  status: { type: String, enum: ['available', 'confirmed', 'canceled'], default: 'available' }
});

appointmentSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Appointment', appointmentSchema);
