const router = require('express').Router();
const passport = require('passport');
const Usuario = require('../models/user');
const user = require('../models/user');
router.get('/', (req, res, next) => {
  let title = 'Mario';
  res.render('index',{ title: title});
});




router.post('/usuarios/add', passport.authenticate('local-signup', {
  successRedirect: '/usuarios',
  failureRedirect: '/usuarios',
  failureFlash: true
})); 

router.get('/usuarios', async(req, res, next) => {
  const usuario = new user;
  const usuarios = await usuario.findAll(req.user._id);
  res.render('usuarios', {
    usuarios
  });
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

router.get('/profile',isAuthenticated, (req, res, next) => {
  res.render('profile');
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});


function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
}

module.exports = router;
