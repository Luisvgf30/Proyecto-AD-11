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

router.get("/asignaturas/aula", isAuthenticated, async (req, res) => {
  const asignatura = new Asignatura();
  const asignaturas = await asignatura.findAll();

  res.render('aulavirtual', {
    asignaturas: asignaturas,
  });
});

router.get('/asignaturas/aula/:id', isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura();
  const miasignatura = await asignatura.findById(req.params.id);

  res.render("miasignatura", {
    miasignatura: miasignatura
  });
});

// Añadir asignatura añadiendosela a los usuarios seleccionados
router.post('/asignaturas/add', isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura(req.body);
  asignatura.usuario = req.user._id;
  await asignatura.insert();
  res.redirect('/asignaturas');
});


router.get('/asignaturas/addasignaturas', isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura();
  const asignaturas = await asignatura.findAll();

  res.render('adds/addasignaturas', {
    asignaturas: asignaturas
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

  const alumnos = await usuario.findRol("Alumno");
  const profesores = await usuario.findRol("Profesor");

  asignatura = await asignatura.findById(req.params.id);
  res.render("edits/edit", { asignatura, profesores, alumnos });
});


//editar software
router.get('/asignaturas/miasignatura/:id/:index', isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura();
  const miasignatura = await asignatura.findById(req.params.id);
  let { id } = req.params;
  const { index } = req.params;

  res.render("edits/editsoftware", {
    asignatura: miasignatura,
    index: index
  });
});

router.post("/asignaturas/miasignatura/:id/:index", isAuthenticated, async (req, res, next) => {
  const software =  req.body.software;
  let { id } = req.params;
  const { index } = req.params;
  try {
    // Encuentra la asignatura por id
    let asignatura = await Asignatura.findById(req.params.id);
      asignatura.software[index] =  software;
      

    // Guarda la asignatura actualizada
    await asignatura.save();
    res.render("miasignatura", {
      miasignatura: asignatura
    });
  } catch (error) {
    // Manejo de errores
    console.error("Error al editar asignatura:", error);
    res.status(500).send("Error al editar asignatura");
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
  let usu = req.user;

  try {

    // Encuentra la asignatura por id
    let asignatura = await Asignatura.findById(id);

    // Actualiza los datos de la asignatura
    if(usu.rol == "Administrador"){
      asignatura.nombre = updatedAsignaturaData.nombre;
      asignatura.planEstudios = updatedAsignaturaData.planEstudios;
      asignatura.cuatrimestre = updatedAsignaturaData.cuatrimestre;
      asignatura.curso = updatedAsignaturaData.curso;
      asignatura.software = updatedAsignaturaData.software;
    }else{
      asignatura.software = updatedAsignaturaData.software;
    }
    
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


router.get(
  "/asignaturas/softwaredelete/:id/:index",
  isAuthenticated,
  async (req, res, next) => {
    let { id } = req.params;
    const { index } = req.params;
    const asignatura = await Asignatura.findById(id);

    for (let i = 0; i < asignatura.software.length; i++) {
      if(index==i){
        asignatura.software.splice(i, 1);
    }
  }
    // Elimina la asignatura
    await asignatura.update(id, asignatura);

    res.redirect("/asignaturas/aula/"+id);

  }
);

router.get('/asignaturas/addsoftware/:id', isAuthenticated, async (req, res, next) => {
  try {
    let { id } = req.params;
    const asignatura = await Asignatura.findById(id);

    res.render("adds/addsoftware", {
      asignatura,
    });
  } catch (error) {
    next(error);
  }
});


router.post("/asignaturas/addsoftware/:id", isAuthenticated, async (req, res, next) => {
  const software =  req.body.software;
  const { id } = req.params;
  const asignatura = await Asignatura.findById(id);

  asignatura.software.push(software);

  await asignatura.update(id, asignatura);


  res.redirect("/asignaturas/aula/"+id);
});




function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
}
module.exports = router;
