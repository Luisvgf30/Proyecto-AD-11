const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SugerenciaSchema = new Schema({
    mail: {
      type: String,
      required: true
    },
    contenido: {
      type: String,
      required: true
    },
    fecha:{
      type: Date,
      required: true
    }
  });
  
  SugerenciaSchema.methods.findAll = async function () {
    const Sugerencia = mongoose.model("sugerencias", SugerenciaSchema);
    return await Sugerencia.find();
  };
  
  SugerenciaSchema.methods.insert = async function () {
    await this.save()
      .then(res => {
        console.log("saved: " + res);
      }).catch(err => {
        console.log(err)
      });
  };

  SugerenciaSchema.methods.findById = async function (id) {
    const Sugerencia = mongoose.model("sugerencias", SugerenciaSchema);
    return await Sugerencia.findById(id);
  };

  
  module.exports = mongoose.model('sugerencia', SugerenciaSchema);
  