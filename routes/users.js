const router = require('express').Router();
const passport = require('passport');
const user = require('../models/user');
const Asignatura = require('../models/asignatura');
const { default: mongoose } = require('mongoose');
const fs = require('fs');// filesystem
const csv = require('csv-parser');// Encargado de parsear
const result = [];

router.get('/', (req, res, next) => {
  res.render('signin');
});

// añadir usuario ****************************************************************
router.post('/usuarios/add', passport.authenticate('local-signup', {
  successRedirect: '/usuarios',
  failureRedirect: '/usuarios/addusuarios',
  failureFlash: true
}));

router.get('/usuarios/addusuarios', isAuthenticated, async (req, res, next) => {
  if (req.user.rol == "Administrador") {
    var usuario = new user();
    var asignatura = new Asignatura();

    const asignaturas = await asignatura.findAll();

    usuario = await usuario.findById(req.params.id);
    res.render('adds/addusuarios', { usuario, asignaturas });
  } else {
    return res.redirect("/profile");
  }
});

router.post('/usuarios/addUserCSV', async (req, res) => {
  var fileUsers = req.files.file;
  try {
    await fileUsers.mv(`./files/users/${fileUsers.name}`);
    readCsvFile(`./files/users/${fileUsers.name}`);
    res.redirect("/usuarios");
  } catch (err) {
    console.error('Error al mover el archivo:', err);
    res.status(500).send({ message: err });
  }
});

const readCsvFile = async (fileName) => {
  const results = [];
  try {
    await fs.createReadStream(fileName)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        for (const usu of results) {
          var usuario = new user();
          if (usu.nombre && usu.rol && usu.password) {
            var usuarioEmail = await usuario.findEmail(usu.email);
            if (usuarioEmail == null) {
              usuario.nombre = usu.nombre;
              usuario.apellidos = usu.apellidos;
              usuario.rol = usu.rol;
              usuario.email = usu.email;
              usuario.password = await usuario.encryptPassword(usu.password);
              const asignaturas = usu.asignaturas.split(',');
              usuario.asignaturas = asignaturas;

              await usuario.save();
            } else {
              console.error('El mail no se puede repetir');
            }
          } else {
            console.error('Algunos campos requeridos están vacíos. El usuario no se guardará.');
          }
        }
      });
  } catch (err) {
    console.error('Error al leer el archivo CSV:', err);
  }
};


// Añadir asignatura añadiendosela a los usuarios seleccionados ***********************************************
router.get('/usuarios', isAuthenticated, async (req, res, next) => {
  if (req.user.rol == "Administrador") {
    const usuario = new user;
    const usuarios = await usuario.findAll(req.user.id);
    const asignatura = new Asignatura;
    const asignaturas = await asignatura.findAll();
    res.render('elements/usuarios', {
      usuarios, asignaturas
    });
  } else {
    return res.redirect("profile");
  }
});


// editar usuarios ****************************************************************************
router.get('/usuarios/editusu/:id', isAuthenticated, async (req, res, next) => {
  if (req.user.rol == "Administrador") {
    var usuario = new user();
    var asignatura = new Asignatura();

    const asignaturas = await asignatura.findAll();
    usuario = await usuario.findById(req.params.id);

    res.render('edits/editusu', { usuario, asignaturas });
  } else {
    return res.redirect("/profile");
  }
});

router.post('/usuarios/editusu/:id', isAuthenticated, async (req, res, next) => {
  try {
    const usuario = new user();
    const { id } = req.params;

    req.body.password = usuario.encryptPassword(req.body.password);

    //Obtenemos el usu antiguo y el nuevo para editar la lista asignaturas de sus usuarios.
    await usuario.update({ _id: id }, req.body);
    res.redirect('/usuarios');
  } catch (error) {
    next(error);
  }

});

// borrar usuarios ************************************************************
router.get('/usuarios/delete/:id', isAuthenticated, async (req, res, next) => {
  if (req.user.rol == "Administrador") {
    const usuario = new user();
    let { id } = req.params;
    await usuario.delete(id);
    res.redirect('/usuarios');
  } else {
    return res.redirect("/profile");
  }
});


router.get('/signup', (req, res, next) => {
  res.render('signup');

});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.get('/signin', (req, res, next) => {
  res.render('signin');
});


router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/profile',
  failureRedirect: '/signin',
  failureFlash: true
}));

router.get('/profile', isAuthenticated, async (req, res, next) => {
  const usuario = new user;

  var asignatura = new Asignatura();
  const asignaturas = await asignatura.findAll();

  let { id } = req.params;
  let miusuario = await usuario.findById(id);

  res.render('elements/profile', {
    miusuario: miusuario, asignaturas: asignaturas
  });
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
}

module.exports = router;
