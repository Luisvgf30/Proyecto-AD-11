const router = require('express').Router();
const passport = require('passport');
const Asignatura = require('../models/asignatura');
const { default: mongoose } = require('mongoose');

//Aula virtual con las asignaturas
router.get("/aulavirtual", isAuthenticated, async (req, res) => {
    const asignatura = new Asignatura();
    const asignaturas = await asignatura.findAll();

    res.render('elements/aulavirtual', {
        asignaturas: asignaturas,
    });
});

//
router.get('/miasignatura/:id', isAuthenticated, async (req, res, next) => {
    const asignatura = new Asignatura();
    const miasignatura = await asignatura.findById(req.params.id);

    res.render("elements/miasignatura", {
        miasignatura: miasignatura
    });
});

router.get(
    "/miasignatura/softwaredelete/:id/:index",
    isAuthenticated,
    async (req, res, next) => {
        if (req.user.rol != "Alumno") {
            let { id } = req.params;
            const { index } = req.params;
            const asignatura = await Asignatura.findById(id);

            for (let i = 0; i < asignatura.software.length; i++) {
                if (index == i) {
                    asignatura.software.splice(i, 1);
                }
            }
            // Elimina la asignatura
            await asignatura.update(id, asignatura);

            res.redirect("/miasignatura/" + id);
        } else {
            return res.redirect("/profile");
        }
    }
);

//editar software
router.get('/miasignatura/editsoftware/:id/:index', isAuthenticated, async (req, res, next) => {
    if (req.user.rol != "Alumno") {
        const asignatura = new Asignatura();
        const miasignatura = await asignatura.findById(req.params.id);
        const { index } = req.params;

        res.render("edits/editsoftware", {
            asignatura: miasignatura,
            index: index
        });
    } else {
        return res.redirect("/profile");
    }
});

router.post("/miasignatura/editsoftware/:id/:index", isAuthenticated, async (req, res, next) => {
    const software = req.body.software;
    let { id } = req.params;
    const { index } = req.params;
    try {
        // Encuentra la asignatura por id
        let asignatura = await Asignatura.findById(req.params.id);
        asignatura.software[index] = software;


        // Guarda la asignatura actualizada
        await asignatura.save();
        res.redirect("/miasignatura/" + id);
    } catch (error) {
        // Manejo de errores
        console.error("Error al editar asignatura:", error);
        res.status(500).send("Error al editar asignatura");
    }
});

//Añadir software
router.get('/miasignatura/addsoftware/:id', isAuthenticated, async (req, res, next) => {
    if (req.user.rol != "Alumno") {
        try {
            let { id } = req.params;
            const asignatura = await Asignatura.findById(id);

            res.render("adds/addsoftware", {
                asignatura,
            });
        } catch (error) {
            next(error);
        }
    } else {
        return res.redirect("/profile");
    }
});

router.post("/miasignatura/addsoftware/:id", isAuthenticated, async (req, res, next) => {
    const software = req.body.software;
    const { id } = req.params;
    const asignatura = await Asignatura.findById(id);

    asignatura.software.push(software);

    await asignatura.update(id, asignatura);
    res.redirect("/miasignatura/" + id);
});

router.get('/miasignatura/mail', isAuthenticated, async (req, res, next) => {
    
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/");
}
module.exports = router;
