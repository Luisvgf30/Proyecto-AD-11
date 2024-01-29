const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'professor', 'student'], required: true },
  
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
  await this.save((err, res) => {
    err ? console.log(err) : "";
    console.log("saved: " + res);
  });
};

module.exports = mongoose.model('user', userSchema);
