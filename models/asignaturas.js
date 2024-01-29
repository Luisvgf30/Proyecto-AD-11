const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subjectSchema = new Schema({
    nombre: { type: String, required: true },
    planEstudios: { type: String},
    cuatrimestre:  { type: Number },
    curso: {type: Number},
    software: {type:  Array}

});

module.exports = mongoose.model('Subject', subjectSchema);
