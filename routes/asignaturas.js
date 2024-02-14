const express = require("express");
const router = express.Router();
const Asignatura = require("../models/asignatura");
const Usuario = require("../models/user");
const mongoose = require("mongoose");

router.get("/asignaturas", isAuthenticated, async (req, res) => {
  const asignatura = new Asignatura();
  const usuario = new Usuario();
  const asignaturas = await asignatura.findAll();
  const alumnos = await usuario.findRol("Alumno");
  const profesores = await usuario.findRol("Profesor");

  res.render("asignaturas", {
    asignaturas: asignaturas,
    alumnos: alumnos,
    profesores: profesores,
  });
});

router.post('/asignaturas/add', isAuthenticated,async (req, res, next) => {
  const asignatura = new Asignatura(req.body);
  asignatura.usuario=req.user._id;
  await asignatura.insert();
  res.redirect('/asignaturas');
});

router.get('/asignaturas/addasignaturas', isAuthenticated,async (req, res, next) => {
  const asignatura = new Asignatura();
  const usuario = new Usuario();
  const asignaturas = await asignatura.findAll();
  const alumnos = await usuario.findRol("Alumno");
  const profesores = await usuario.findRol("Profesor");

  res.render('addasignaturas', {
    asignaturas : asignaturas, alumnos : alumnos, profesores : profesores
  });
});

router.get('/asignaturas/turn/:id',isAuthenticated, async (req, res, next) => {
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

// Editar asignatura editando la lista de todos los usuarios que la tengan
router.post('/asignaturas/edit/:id', isAuthenticated, async (req, res, next) => {
  try {
    const asignatura = new Asignatura();
    const { id } = req.params;

    //Obtenemos la asignatura antigua y la nueva para editar la lista asignaturas de sus usuarios.
    let asignaturaVieja = await asignatura.findById(id);
    await asignatura.update({ _id: id }, req.body);
    let asignaturaNueva = await asignatura.findById(id);

    //Borramos las asignaturas de los profesores de la asignatura antigua
    for (let profesorId of asignaturaVieja.profesores) {
      let profesor = await Usuario.findById(profesorId);
      await profesor.deleteAsignaturas(asignaturaVieja.id);
    }
    //Añadimos las asignaturas de los profesores de la asignatura nueva
    for (let profesorId of asignaturaNueva.profesores) {
      let profesor = await Usuario.findById(profesorId);
      await profesor.addAsignatura(asignaturaNueva.id);
    }
    
    //Borramos las asignaturas de los alumnos de la asignatura antigua
    for (let alumnoId of asignaturaVieja.alumnos) {
      let alumno = await Usuario.findById(alumnoId);
      await alumno.deleteAsignaturas(asignaturaVieja.id);
    }
    //Añadimos las asignaturas de los alumnos de la asignatura nueva
    for (let alumnoId of asignaturaNueva.alumnos) {
      let alumno = await Usuario.findById(alumnoId);
      await alumno.addAsignatura(asignaturaNueva.id);
    }

    await asignatura.update({ _id: id }, req.body);
    res.redirect('/asignaturas');
  } catch (error) {
    next(error);
  }

});

//borrar asignatura borrando todas las asignaturas de la lista de los usuarios
router.get(
  "/asignaturas/delete/:id",
  isAuthenticated,
  async (req, res, next) => {
    let { id } = req.params;
    let usuario = new Usuario();
    let usuarios = await usuario.findAll();

    for(let i = 0; i < usuarios.length; i++) {
      for(let j = 0; j < usuarios[i].asignaturas.length; j++) {
        if(usuarios[i].asignaturas[j].toString() == id) {
          usuarios[i].asignaturas.splice(j, 1);
          await usuario.update({_id: id}, usuarios[i]);
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

  let asignaturas = await asignatura.findAll();
  let asignaturaLast = asignaturas[asignaturas.length - 1];

  // Comprueba si asignatura.profesores y asignatura.alumnos son arrays
  if (Array.isArray(asignaturaLast.profesores)) {
    for (let profesorId of asignaturaLast.profesores) {
      let profesor = await Usuario.findById(profesorId);
      await profesor.addAsignatura(asignaturaLast.id);
    }
  }

  if (Array.isArray(asignaturaLast.alumnos)) {
    for (let alumnoId of asignaturaLast.alumnos) {
      let alumno = await Usuario.findById(alumnoId);
      await alumno.addAsignatura(asignaturaLast.id);
    }
  }

  res.redirect("/asignaturas");
});

// Editar asignatura y actualizar relaciones con usuarios
router.post("/asignaturas/edit/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const updatedAsignaturaData = req.body;

  try {
    let Asignatura = mongoose.model("asignatura");
    let Usuario = mongoose.model("user");

    // Encuentra la asignatura por id
    let asignatura = await Asignatura.findById(id);

    // Actualiza los datos de la asignatura
    asignatura.nombre = updatedAsignaturaData.nombre;
    asignatura.descripcion = updatedAsignaturaData.descripcion;

    // Guarda la asignatura actualizada
    await asignatura.save();

    // Actualiza las relaciones con profesores y alumnos
    for (let profesorId of updatedAsignaturaData.profesores) {
      let profesor = await Usuario.findById(profesorId);
      await profesor.editAsignaturas(profesor.id, id);
    }

    for (let alumnoId of updatedAsignaturaData.alumnos) {
      let alumno = await Usuario.findById(alumnoId);
      await alumno.editAsignaturas(alumno.id, id);
    }

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
