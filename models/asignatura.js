const mongoose = require('mongoose');
const { findById } = require('./user');

const Schema = mongoose.Schema;

const AsignaturaSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  planEstudios: {
    type: String
  },
  cuatrimestre: {
    type: Number
  },
  curso: {
    type: Number
  },
  software: {
    type: Array
  },
  profesores: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'profesores'
  }],
  alumnos: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'alumnos'
  }],
});


AsignaturaSchema.methods.findAll = async function () {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  return await Asignatura.find();
};

AsignaturaSchema.methods.insert = async function () {
  //await this.save();
  await this.save()
    .then(res => {
      console.log("saved: " + res);
    }).catch(err => {
      console.log(err)
    });
};

AsignaturaSchema.methods.update = async (id, asignatura) => {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  await Asignatura.updateOne({ _id: id }, asignatura)
    .then(res => {
      console.log("saved: " + res);
    }).catch(err => {
      console.log(err)
    });
};

AsignaturaSchema.methods.delete = async function (id) {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  await Asignatura.deleteOne({ _id: id })
    .then(res => {
      console.log("delete: " + res);
    }).catch(err => {
      console.log(err)
    });

};

AsignaturaSchema.methods.findById = async function (id) {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  return await Asignatura.findById(id);
};

AsignaturaSchema.methods.findSearch = async function (search, asignatura) {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  return await Asignatura.find({ 'title': new RegExp(search, 'i'), 'asignatura': asignatura });
};

// añadir una usario a un asigntura existente
AsignaturaSchema.methods.addUsuario = async function (usuarioId, usuarioRol) {
  try {

    await this.save();
    if (usuarioRol === "Profesor" || usuarioRol === "Administrador") {
      this.profesores.push(usuarioId);
      await this.save();
    }

    if (usuarioRol === "Alumno") {
      this.alumnos.push(usuarioId);
      await this.save();
    }

    console.log(`Usuario ${usuarioId} agregado a la asignatura ${this._id}`);
  } catch (error) {
    console.error(`Error al agregar usuario ${usuarioId} a la asignatura ${this.nombre}:, error`);
    throw error;
  }
};

// añadir un metodo para eliminar usuarios de una asignatura existente
AsignaturaSchema.methods.deleteUser = async function (usuarioId, usuarioRol) {

  console.log(usuario.id);
  console.log(usuario.rol);
  console.log(asignaturaId);


  try {
    if (usuarioRol === "Profesor" || usuarioRol === "Administrador") {
      console.log("profesor");
      this.profesores = this.profesores.filter(usuario => usuario.toString() !== usuarioId);
      await this.save()
      .then(result => console.log(result))
      .catch(error => console.log(error));
    }

    if (usuarioRol === "Alumno") {
      console.log("alumno");
      this.alumnos = this.alumnos.filter(usuario => usuario.toString() !== usuarioId);
      await this.save()
      .then(result => console.log(result))
      .catch(error => console.log(error));
    }

  } catch (error) {
    console.error(`Error al agregar usuario ${usuarioId} a la asignatura ${this.nombre}:, error`);
    throw error;
  }

};

module.exports = mongoose.model('asignatura', AsignaturaSchema);
