const express = require("express");
const router = express.Router();
const Asignatura = require("../models/asignatura");
const Usuario = require("../models/user");
const mongoose = require("mongoose");
const Mail = require("../public/javascripts/mail");
const fs = require('fs');// filesystem
const csv = require('csv-parser');// Encargado de parsear
const result = [];

router.get("/asignaturas", isAuthenticated, async (req, res) => {
  if (req.user.rol == "Administrador") {
    const asignatura = new Asignatura();
    const usuario = new Usuario();
    let { id } = req.params;
    const miusuario = await usuario.findById(id);
    const asignaturas = await asignatura.findAll();
    const alumnos = await usuario.findRol("Alumno");
    const profesores = await usuario.findRol("Profesor");
    res.render("elements/asignaturas", {
      asignaturas: asignaturas,
      alumnos: alumnos,
      profesores: profesores,
      miusuario: miusuario
    });
  } else {
    return res.redirect("profile");
  }
});

// Añadir asignaturas post
router.post('/asignaturas/add', isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura(req.body);
  asignatura.usuario = req.user._id;
  await asignatura.insert();

  res.redirect('/asignaturas');
});

// Añadir asignaturas get
router.get('/asignaturas/addasignaturas', isAuthenticated, async (req, res, next) => {
  if (req.user.rol == "Administrador") {
    const asignatura = new Asignatura();
    const asignaturas = await asignatura.findAll();

    res.render('adds/addasignaturas', {
      asignaturas: asignaturas
    });
  } else {
    return res.redirect("/profile");
  }
});

router.post('/asignaturas/addAsignaturaCSV', (req, res) => {
  var fileAsignaturas = req.files.file;
  cont = 0;
  console.log(fileAsignaturas.mimetype);
  fileAsignaturas.mv(`./files/asignaturas/${fileAsignaturas.name}`, err => {
    if (err) return res.status(500).send({ message: err });
    readCsvFile(`./files/asignaturas/${fileAsignaturas.name}`);
    res.redirect("/asignaturas");
  });
});

const readCsvFile = async (fileName) => {
  await fs.createReadStream(fileName)
    .pipe(csv({ separator: ";" }))
    .on("data", (data) => result.push(data))
    .on("end", () => {

      result.map(async asig => {
        var asignatura = new Asignatura();

        if (asig.nombre && asig.cuatrimestre && asig.curso && asig.planEstudios) {
          asignatura.nombre = asig.nombre;
          asignatura.planEstudios = asig.planEstudios;
          asignatura.cuatrimestre = asig.cuatrimestre;
          asignatura.curso = asig.curso;
          await asignatura.save();
        } else {
          console.error('error');
        }
      });

    })
};

router.get('/asignaturas/turn/:id', isAuthenticated, async (req, res, next) => {
  let { id } = req.params;
  const asignatura = await Asignatura.findById(id);
  asignatura.status = !asignatura.status;
  await asignatura.insert();
  res.redirect("/asignaturas");
});

// Render Editar asignatura
router.get('/asignaturas/edit/:id', isAuthenticated, async (req, res, next) => {
  if (req.user.rol == "Administrador") {
    var asignatura = new Asignatura();
    const usuario = new Usuario();

    const alumnos = await usuario.findRol("Alumno");
    const profesores = await usuario.findRol("Profesor");

    asignatura = await asignatura.findById(req.params.id);
    res.render("edits/edit", { asignatura, profesores, alumnos });
  } else {
    return res.redirect("/profile");
  }
});

//borrar asignatura borrando todas las asignaturas de la lista de los usuarios
router.get(
  "/asignaturas/delete/:id",
  isAuthenticated,
  async (req, res, next) => {
    //Uso del delete
    let { id } = req.params;
    let usuario = new Usuario();
    let usuarios = await usuario.findAll();

    //Uso de mailer
    const usu = new Usuario();
    const alumnos = await usu.findRol("Alumno");
    const asig = new Asignatura();
    const asignatura = await asig.findById({ _id: id });

    for (let i = 0; i < alumnos.length; i++) {
      for (let j = 0; j < alumnos[i].asignaturas.length; j++) {
        console.log(alumnos[i].asignaturas[j].toString());
          if (alumnos[i].asignaturas[j].toString() == id) {
            enviarmail("practicamariomail@gmail.com", alumnos[i].email, "Borrar Asignatura", `Asignatura ${asignatura.nombre} ha sido eliminada`);
          }
      }
    }

    for (let i = 0; i < usuarios.length; i++) {
      for (let j = 0; j < usuarios[i].asignaturas.length; j++) {
        if (usuarios[i].asignaturas[j].toString() == id) {
          usuarios[i].asignaturas.splice(j, 1);
          await usuario.update({ _id: usuarios[i]._id }, usuarios[i]);
        }
      }
    }

    // Elimina la asignatura
    await Asignatura.deleteOne({ _id: id });
    res.redirect("/asignaturas");
  }
);

// Editar asignatura y actualizar relaciones con usuarios
router.post("/asignaturas/edit/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const updatedAsignaturaData = req.body;

  //Uso de mailer
  const usu = new Usuario();
  const alumnos = await usu.findRol("Alumno");
  const asig = new Asignatura();
  const asignatura = await asig.findById({ _id: id });

  for (let i = 0; i < alumnos.length; i++) {
    for (let j = 0; j < alumnos[i].asignaturas.length; j++) {
      console.log(alumnos[i].asignaturas[j].toString());
        if (alumnos[i].asignaturas[j].toString() == id) {
          enviarmail("practicamariomail@gmail.com", alumnos[i].email, "Edición Asignatura", `Asignatura ${asignatura.nombre} ha sido editada`);
        }
    }
  }

  try {

    // Encuentra la asignatura por id
    let asignatura = await Asignatura.findById(id);

    // Actualiza los datos de la asignatura
    asignatura.nombre = updatedAsignaturaData.nombre;
    asignatura.planEstudios = updatedAsignaturaData.planEstudios;
    asignatura.cuatrimestre = updatedAsignaturaData.cuatrimestre;
    asignatura.curso = updatedAsignaturaData.curso;

    // Guarda la asignatura actualizada
    await asignatura.save();
    res.redirect("/asignaturas");
  } catch (error) {
    // Manejo de errores
    console.error("Error al editar asignatura:", error);
    res.status(500).send("Error al editar asignatura");
  }
});

router.get("/asignaturas/search", isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura();
  let search = req.query.search;
  const asignaturas = await asignatura.findSearch(search, req.user._id);
  res.render("asignaturas", {
    asignaturas,
  });
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
}
module.exports = router;
