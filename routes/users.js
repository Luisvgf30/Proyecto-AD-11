const router = require('express').Router();
const passport = require('passport');
const Usuario = require('../models/user');
const user = require('../models/user');
const Asignatura = require('../models/asignatura');
const { default: mongoose } = require('mongoose');
router.get('/', (req, res, next) => {
  res.render('signin');
});

<<<<<<< HEAD
router.post('/usuarios/add', passport.authenticate('local-signup', {
  successRedirect: '/usuarios',
  failureRedirect: '/usuarios',
  failureFlash: true
})); 
=======
// router.post('/usuarios/add', passport.authenticate('local-signup', {
//   successRedirect: '/usuarios',
//   failureRedirect: '/usuarios',
//   failureFlash: true
// })); 

// Añadir asignatura añadiendosela a los usuarios seleccionados
router.post("/usuarios/add", isAuthenticated, async (req, res, next) => {
  const usuario = new Usuario(req.body);
  usuario.asignatura = req.user._id;
  await usuario.insert();

  let usuarios = await usuario.findAll();
  let usuariosLast = usuarios[usuarios.length - 1];

  // Comprueba si asignatura.profesores y asignatura.alumnos son arrays
  if (Array.isArray(usuariosLast.asignaturas)) {
    for (let asignaturaId of usuariosLast.asignaturas) {
      let asignatura = await Asignatura.findById(asignaturaId);
      await asignatura.addUsuario(usuariosLast.id, usuariosLast.rol);
    }
  }
  res.redirect("/usuarios");
});
>>>>>>> raul

// Añadir asignatura añadiendosela a los usuarios seleccionados
router.get('/usuarios', async(req, res, next) => {
  const usuario = new user;
  const usuarios = await usuario.findAll(req.user.id);
  const asignatura = new Asignatura;
  const asignaturas = await asignatura.findAll();
  res.render('usuarios', {
    usuarios, asignaturas
  });
});

router.get('/usuarios/addusuarios', isAuthenticated, async (req, res, next) => {
  var usuario = new user();
  var asignatura = new Asignatura();

  const usuarios = await usuario.findAll(req.user._id);
  const asignaturas = await asignatura.findAll();

  usuario = await usuario.findById(req.params.id);
  res.render('addusuarios', { usuario, asignaturas });
});

router.get('/usuarios/editusu/:id', isAuthenticated, async (req, res, next) => {
  var usuario = new user();
  var asignatura = new Asignatura();

  const usuarios = await usuario.findAll(req.user._id);
  const asignaturas = await asignatura.findAll();

  usuario = await usuario.findById(req.params.id);
  res.render('editusu', { usuario, asignaturas });
});

router.post('/usuarios/editusu/:id',isAuthenticated, async (req, res, next) => {
  try {
    const usuario = new user();
    const { id } = req.params;

    //Obtenemos el usu antiguo y el nuevo para editar la lista asignaturas de sus usuarios.
    let usuViejo = await usuario.findById(id);
    await usuario.update({ _id: id }, req.body);
    let usuNuevo = await usuario.findById(id);

    //Borramos las asignaturas de los profesores de la asignatura antigua
    for (let asignaturaId of usuViejo.asignaturas) {
      let asignatura = await Asignatura.findById(asignaturaId);
      await asignatura.deleteUser(usuViejo.id);
    }
    //Añadimos las asignaturas de los profesores de la asignatura nueva
    for (let asignaturaId of usuNuevo.asignaturas) {
      let asignatura = await Asignatura.findById(asignaturaId);
      await asignatura.addUsuario(usuNuevo.id);
    }
  
    await usuario.update({ _id: id }, req.body);
    res.redirect('/usuarios');
  } catch (error) {
    next(error);
  }

});


router.get('/usuarios/delete/:id', isAuthenticated,async (req, res, next) => {
  const usuario = new user();
  const asignatura = new Asignatura();

  let { id } = req.params;
  let thisUsuario = await usuario.findById(id);
  let asignaturas = await asignatura.findAll();


  // borrar usuario dentro del array  de usuarios en la sesión
   for(let i = 0; i < asignaturas.length; i++) {
    let asignaturaChange = await asignatura.findById(asignaturas[i]);
    await asignaturaChange.deleteUser(thisUsuario);
   }    

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

router.get('/profile',isAuthenticated, async(req, res, next) => {
  const usuario = new user;
  const usuarios = await usuario.findAll(req.user._id);
  const asignatura = new Asignatura;
  const asignaturas = await asignatura.findAll();
  res.render('profile', {
    usuarios, asignaturas
  });
});

router.get("/logout", function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});


function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
}

module.exports = router;
