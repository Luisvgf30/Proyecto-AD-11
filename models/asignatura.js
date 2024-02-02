const mongoose = require('mongoose');

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
  await Asignatura.updateOne({_id: id}, asignatura)
    .then(res => {
      console.log("saved: " + res);
    }).catch(err => {
      console.log(err)
    });
    console.log("prueba update")
};

AsignaturaSchema.methods.delete = async function (id) {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  await Asignatura.deleteOne({ _id: id }, err => {
    if (err) console.log(err);
  });
  console.log(id + " deleted");
};

AsignaturaSchema.methods.findById = async function (id) {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  return await Asignatura.findById(id);
};

AsignaturaSchema.methods.findSearch = async function (search, asignatura) {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  return await Asignatura.find({ 'title': new RegExp(search, 'i'), 'asignatura': asignatura });
};

module.exports = mongoose.model('asignatura', AsignaturaSchema);
