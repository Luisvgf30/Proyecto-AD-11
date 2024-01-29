const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subjectSchema = new Schema({
    nombre: { 
        type: String, 
        required: true 
    },
    planEstudios: { 
        type: String
    },
    cuatrimestre:  { 
        type: Number 
    },
    curso: {
        type: Number
    },
    software: {
        type:  Array
    },
    responsables: [{
        type: mongoose.Schema.Types.ObjectId, ref:'profesores'}
    ],
    alumnos: [{
        type: mongoose.Schema.Types.ObjectId, ref:'alumnos'
    }],
  


});


TaskSchema.methods.findAll= async function (asignatura) {
    const Task = mongoose.model("tasks", TaskSchema);
    return await Task.find({'asignatura':asignatura});
  };

  TaskSchema.methods.insert= async function () {
    //await this.save();
    await this.save((err, res) => {
      err ? console.log(err) : "";
      console.log("saved: " + res);
    });
  };

  
TaskSchema.methods.update= async (id, task) => {
    const Task = mongoose.model("tasks", TaskSchema);
    await Task.updateOne({_id: id}, task, err => {
      if (err) console.log(err);
    });
    console.log(id + " updated");
  };

  TaskSchema.methods.delete= async function (id) {
    const Task = mongoose.model("tasks", TaskSchema);
    await Task.deleteOne({_id: id}, err => {
      if (err) console.log(err);
    });
    console.log(id + " deleted");
  
  };

  TaskSchema.methods.findById= async function (id) {
    const Task = mongoose.model("tasks", TaskSchema);
    return await Task.findById(id);
  };

  TaskSchema.methods.findSearch= async function (search, asignatura) {
    const Task = mongoose.model("tasks", TaskSchema);
    return await Task.find({'title' : new RegExp(search, 'i'),'asignatura': asignatura});
  };

module.exports = mongoose.model('Subject', subjectSchema);
