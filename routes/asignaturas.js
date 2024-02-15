const express = require("express");
const router = express.Router();
const Asignatura = require("../models/asignatura");
const Usuario = require("../models/user");
const mongoose = require("mongoose");

router.get("/asignaturas", isAuthenticated, async (req, res) => {
  const asignatura = new Asignatura();
  const usuario = new Usuario();
  let { id } = req.params;
  const miusuario = await usuario.findById(id);
  const asignaturas = await asignatura.findAll();
  const alumnos = await usuario.findRol("Alumno");
  const profesores = await usuario.findRol("Profesor");

  res.render("asignaturas", {
    asignaturas: asignaturas,
    alumnos: alumnos,
    profesores: profesores,
    miusuario: miusuario
  });
});

router.post('/asignaturas/add', isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura(req.body);
  asignatura.usuario = req.user._id;
  await asignatura.insert();
  res.redirect('/asignaturas');
});

router.get('/asignaturas/addasignaturas', isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura();
  const usuario = new Usuario();
  const asignaturas = await asignatura.findAll();
  const alumnos = await usuario.findRol("Alumno");
  const profesores = await usuario.findRol("Profesor");

  res.render('addasignaturas', {
    asignaturas: asignaturas, alumnos: alumnos, profesores: profesores
  });
});

router.get('/asignaturas/turn/:id', isAuthenticated, async (req, res, next) => {
  let { id } = req.params;
  const asignatura = await Asignatura.findById(id);
  asignatura.status = !asignatura.status;
  await asignatura.insert();
  res.redirect("/asignaturas");
});

// Render Editar asignatura
router.get('/asignaturas/edit/:id', isAuthenticated, async (req, res, next) => {
  var asignatura = new Asignatura();
  const usuario = new Usuario();
  const asignaturas = await asignatura.findAll(req.user._id);

  const alumnos = await usuario.findRol("Alumno");
  const profesores = await usuario.findRol("Profesor");

  asignatura = await asignatura.findById(req.params.id);
  res.render("edit", { asignatura, profesores, alumnos });
});



//borrar asignatura borrando todas las asignaturas de la lista de los usuarios
router.get(
  "/asignaturas/delete/:id",
  isAuthenticated,
  async (req, res, next) => {
    let { id } = req.params;
    let usuario = new Usuario();
    let usuarios = await usuario.findAll();

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


// Añadir asignatura añadiendosela a los usuarios seleccionados
router.post("/asignaturas/add", isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura(req.body);
  asignatura.usuario = req.user._id;
  await asignatura.insert();

  res.redirect("/asignaturas");
});

// Editar asignatura y actualizar relaciones con usuarios
router.post("/asignaturas/edit/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const updatedAsignaturaData = req.body;

  try {

    // Encuentra la asignatura por id
    let asignatura = await Asignatura.findById(id);

    // Actualiza los datos de la asignatura
    asignatura.nombre = updatedAsignaturaData.nombre;
    asignatura.planEstudios = updatedAsignaturaData.planEstudios;
    asignatura.cuatrimestre = updatedAsignaturaData.cuatrimestre;
    asignatura.curso = updatedAsignaturaData.curso;
    asignatura.software = updatedAsignaturaData.software;


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
