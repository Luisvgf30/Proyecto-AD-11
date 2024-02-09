const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  nombre: { type: String, required: true},
  apellidos: { type: String },
  rol: { type: String, required: true },
  email: { type: String },
  password: { type: String, required: true },
  asignaturas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'asignaturas'}]
});

//prueba 
// encontrar profesores y encontrar alumnos

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
userSchema.methods.findAll= async () => {
  const User = mongoose.model("user", userSchema);
  return  await User.find()
};
userSchema.methods.findRol= async (rol) => {
  const User = mongoose.model("user", userSchema);
  return  await User.find({'rol': rol})
};

userSchema.methods.findById = async function (id) {
  const User = mongoose.model("user", userSchema);
  return await User.findById(id);
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
userSchema.methods.update= async (id, usuario) => {
  const User = mongoose.model("users", userSchema);
  await User.updateOne({_id: id}, usuario)
  .then(res => {
    console.log("delete: " + res);
  })  .catch(err => {
    console.log(err)  });
};

// delete usuario
userSchema.methods.delete= async function (id) {
  const User = mongoose.model("users", userSchema);
  await User.deleteOne({_id: id})
  .then(res => {
    console.log("delete: " + res);
  })  .catch(err => {
    console.log(err)  });
};

// Eliminar una asignatura especifica
userSchema.methods.editAsignaturas = async function(idUsuario, idAsignatura) {
  const User = mongoose.model("users", userSchema);
  
  // Encuentra el usuario por id
  let usuario = await User.findById(idUsuario);
  if (!usuario) {
    console.log(`Usuario con id ${idUsuario} no encontrado.`);
    return;
  }
  
  // Filtra las asignaturas para eliminar la especificada
  usuario.asignaturas = usuario.asignaturas.filter(asignatura => asignatura.toString() !== idAsignatura);
  
  // Guarda el usuario actualizado
  await usuario.save()
    .then(res => {
      console.log("Asignatura eliminada: " + res);
    })
    .catch(err => {
      console.log(err);
    });
};

// añadir una asignatura a un usuario existente
userSchema.methods.addAsignatura = async function (asignaturaId) {
  try {
    this.asignaturas.push(asignaturaId);
    await this.save();
    console.log("Asignatura {"+asignaturaId+"} agregada al usuario {"+this._id+"}");
  } catch (error) {
    console.error("Error al agregar asignatura {"+asignaturaId+"} al usuario {"+this.nombre+"}:, "+ error);
    throw error;
  }
};
module.exports = mongoose.model('user', userSchema);

