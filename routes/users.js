const router = require('express').Router();
const passport = require('passport');
const Usuario = require('../models/user');
const user = require('../models/user');
const Asignatura = require('../models/asignatura');
router.get('/', (req, res, next) => {
  res.render('signin');
});




router.post('/usuarios/add', passport.authenticate('local-signup', {
  successRedirect: '/usuarios',
  failureRedirect: '/usuarios',
  failureFlash: true
}));

router.get('/usuarios', async (req, res, next) => {
  const usuario = new user;
  const usuarios = await usuario.findAll(req.user._id);
  const asignatura = new Asignatura;
  const asignaturas = await asignatura.findAll();
  res.render('usuarios', {
    usuarios, asignaturas
  });
});

router.get('/usuarios/editusu/:id', isAuthenticated, async (req, res, next) => {
  var usuario = new user();
  var asignatura = new Asignatura();

  const usuarios = await usuario.findAll(req.user._id);
  const asignaturas = await asignatura.findAll();

  usuario = await usuario.findById(req.params.id);
  res.render('editusu', { usuario, asignaturas });
});

router.post('/usuarios/add', isAuthenticated, async (req, res, next) => {
  const usuario = new Usuario(req.body);

  // Verifica si usuario.asignaturas es un array
  if (Array.isArray(usuario.asignaturas)) {
    // Itera sobre las asignaturas asociadas al usuario
    for (let asignaturaId of usuario.asignaturas) {
      try {
        // Encuentra la asignatura por su ID
        let asignatura = await Asignatura.findById(asignaturaId);
        // Verifica si la asignatura existe
        if (asignatura) {
          // Agrega el ID del usuario a la lista de profesores o alumnos de la asignatura
          if (usuario.rol === 'Profesor') {
            // Agrega el ID del usuario como profesor
            asignatura.profesores.push(usuario._id);
          } else if (usuario.rol === 'Alumno') {
            // Agrega el ID del usuario como alumno
            asignatura.alumnos.push(usuario._id);
          }
          // Guarda los cambios en la asignatura
          await asignatura.save();
        }
      } catch (error) {
        console.error('Error al agregar asignatura al usuario:', error);
        // Puedes manejar el error según sea necesario
      }
    }
  }

  try {
    // Guarda el usuario en la base de datos
    await usuario.save();
    res.redirect('/usuarios');
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    // Puedes manejar el error según sea necesario
    res.status(500).send('Error al guardar usuario');
  }
});

router.get('/usuarios/delete/:id', isAuthenticated, async (req, res, next) => {
  const usuario = new user();
  let { id } = req.params;
  await usuario.delete(id);
  res.redirect('/usuarios');
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
  const usuarios = await usuario.findAll(req.user._id);
  const asignatura = new Asignatura;
  const asignaturas = await asignatura.findAll();
  res.render('profile', {
    usuarios, asignaturas
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
