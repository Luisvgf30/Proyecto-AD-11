const express = require('express');
const router = express.Router();
const Asignatura = require('../models/asignatura');


router.get('/asignaturas',isAuthenticated, async (req, res) => {
  const asignatura = new Asignatura();
  const asignaturas = await asignatura.findAll(req.user._id);
  console.log(asignaturas);
  res.render('asignaturas', {
    asignaturas
  });
});

router.post('/asignaturas/add', isAuthenticated,async (req, res, next) => {
  const asignatura = new Asignatura(req.body);
  asignatura.usuario=req.user._id;
  await asignatura.insert();
  res.redirect('/asignaturas');
});

router.get('/asignaturas/turn/:id',isAuthenticated, async (req, res, next) => {
  let { id } = req.params;
  const asignatura = await Asignatura.findById(id);
  asignatura.status = !asignatura.status;
  await asignatura.insert();
  res.redirect('/asignaturas');
});


router.get('/asignaturas/edit/:id', isAuthenticated, async (req, res, next) => {
  var asignatura = new Asignatura();
  asignatura = await asignatura.findById(req.params.id);
  res.render('edit', { asignatura });
});

router.post('/asignaturas/edit/:id',isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura();
  const { id } = req.params;
  await asignatura.update({_id: id}, req.body);
  res.redirect('/asignaturas');
});

router.get('/asignaturas/delete/:id', isAuthenticated,async (req, res, next) => {
  const asignatura = new Asignatura();
  let { id } = req.params;
  await asignatura.delete(id);
  res.redirect('/asignaturas');
});

router.get('/asignaturas/search',isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura();
  let search = req.query.search;
  const asignaturas = await asignatura.findSearch(search, req.user._id);
  res.render('asignaturas', {
    asignaturas
  });
});


function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
}
module.exports = router;
