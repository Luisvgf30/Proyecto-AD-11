const router = require('express').Router();
const passport = require('passport');
const Usuario = require('../models/user');
const user = require('../models/user');
const Asignatura = require('../models/asignatura');
const { default: mongoose } = require('mongoose');
router.get('/', (req, res, next) => {
  res.render('signin');
});




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

router.get('/usuarios/editusu/:id', isAuthenticated, async (req, res, next) => {
  var usuario = new user();
  var asignatura = new Asignatura();

  const usuarios = await usuario.findAll(req.user._id);
  const asignaturas = await asignatura.findAll();

  usuario = await usuario.findById(req.params.id);
  res.render('editusu', { usuario, asignaturas });
});

router.post('/usuarios/editusu/:id',isAuthenticated, async (req, res, next) => {
  const usuario = new user();

  const { id } = req.params;
  req.body.password = await usuario.encryptPassword(req.body.password);
  await usuario.update({_id: id}, req.body);
  res.redirect('/usuarios');
});


router.get('/usuarios/delete/:id', isAuthenticated,async (req, res, next) => {
  let Asignatura  = mongoose.model("asignatura");
  let Usuario = mongoose.model("user") ;

  let { id } = req.params;
  var thisUsuario = await Usuario.findById(id);

  // borrar usuario dentro del array  de usuarios en la sesión

  for(let asignaturaId in thisUsuario.asignaturas){
    let asignaturaChange = await Asignatura.findById(asignaturaId);
    await asignaturaChange.deleteUser(id, thisUsuario.rol);
    
    console.log(id);
    console.log(thisUsuario.rol);
    
  }   


  await Usuario.deleteOne({_id: id});
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
