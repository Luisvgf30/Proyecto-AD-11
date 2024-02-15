const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'nombre',
  userApellidosField: 'apellidos',
  userrolField: 'rol',
  useremailField: 'email',
  passwordField: 'password',
  userasignaturasField: 'asignaturas',

  passReqToCallback: true
  }, async (req, email, password, done) => {



  var user = new User();
   user = await user.findEmail( req.body.email);

  if(user) {
    return done(null, false, req.flash('signupMessage', 'The Email is already Taken.'));
  } else {
    //console.log(req.body);
    const newUser = new User();
    newUser.nombre = req.body.nombre;
    newUser.apellidos = req.body.apellidos;
    newUser.email = req.body.email;
    newUser.rol = req.body.rol;
    newUser.asignaturas = req.body.asignaturas;
    newUser.password = newUser.encryptPassword(req.body.password);
    //console.log(newUser);

    await newUser.insert();
    //done(null, null);
    return done(null, req.user);
  }
}));

passport.use('local-signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  var user = new User();
   user = await user.findEmail( email);
  if(!user) {
    return done(null, false, req.flash('signinMessage', 'No User Found'));
  }
  if(!user.comparePassword(password)) {
    return done(null, false, req.flash('signinMessage', 'Incorrect Password'));
  }
  return done(null, user);
}));
