const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Administrador', 'Profesor', 'Alumno'], required: true },
  nombre: { type: String },
  apellidos: { type: String },
  email: { type: String },
  asignaturas: [{ type: Schema.Types.ObjectId, ref: 'asignaturas' }]
});

userSchema.methods.encryptPassword = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
