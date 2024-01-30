const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  nombre: { type: String, required: true},
  apellidos: { type: String },
  rol: { type: String, enum: ['Administrador', 'Profesor', 'Alumno'], required: true },
  email: { type: String },
  password: { type: String, required: true },
  asignaturas: [{ type: Schema.Types.ObjectId, ref: 'asignaturas' }]
});

//Encryption passsword
userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

//Comparamos la passsword
userSchema.methods.comparePassword= function (password) {
  return bcrypt.compareSync(password, this.password);
};

//Encontrar mail
userSchema.methods.findEmail= async (email) => {
  const User = mongoose.model("user", userSchema);
  return  await User.findOne({'email': email})

};

//Insertar usuario
userSchema.methods.insert= async function () {
  //await this.save();
  await this.save()
  .then(res => {
    console.log("saved: " + res);
  })  .catch(err => {
    console.log(err)  });
 

};

// update usuario
userSchema.methods.update= async (id, task) => {
  const User = mongoose.model("users", userSchema);
  await User.updateOne({_id: id}, task, err => {
    if (err) console.log(err);
  });
  console.log(id + " updated");
};

// delete usuario
userSchema.methods.delete= async function (id) {
  const User = mongoose.model("users", userSchema);
  await User.deleteOne({_id: id}, err => {
    if (err) console.log(err);
  });
  console.log(id + " deleted");

};

module.exports = mongoose.model('user', userSchema);
