const router = require('express').Router();
const passport = require('passport');
const Asignatura = require('../models/asignatura');
const { default: mongoose } = require('mongoose');
const path = require('path'); // Asegúrate de importar el módulo 'path'
const Sugerencia = require('../models/sugerencia');
const Usuario = require("../models/user");
const Mail = require("../public/javascripts/mail");

//Aula virtual con las asignaturas
router.get("/aulavirtual", isAuthenticated, async (req, res) => {
    const asignatura = new Asignatura();
    const asignaturas = await asignatura.findAll();

    res.render('elements/aulavirtual', {
        asignaturas: asignaturas,
    });
});

router.get('/buzon', isAuthenticated, async (req, res, next) => {
    const enviado = false;
    res.render('elements/buzon', {
        enviado: enviado
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

//Descargar archivo
router.get('/miasignatura/download/:id/:software', isAuthenticated, async (req, res, next) => {
    var { software } = req.params;

    var filePath = path.join(__dirname, '..', 'files', 'softwares', software);

    res.download(filePath, (err) => {
        if (err) {
            console.error('Error al descargar el archivo:', err);
            return next(err);
        }
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

            //Uso de mailer
            const usu = new Usuario();
            const alumnos = await usu.findRol("Alumno");

            for (let i = 0; i < alumnos.length; i++) {
                for (let j = 0; j < alumnos[i].asignaturas.length; j++) {
                console.log(alumnos[i].asignaturas[j].toString());
                    if (alumnos[i].asignaturas[j].toString() == id) {
                    enviarmail("practicamariomail@gmail.com", alumnos[i].email, "Eliminar Software", `Software de la asignatura ${asignatura.nombre} ha sido eliminado`);
                    }
                }
            }

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

     //Uso de mailer
     const usu = new Usuario();
     const alumnos = await usu.findRol("Alumno");
     const asig =  new Asignatura();
     const asignatura = await asig.findById({ _id: id });

     for (let i = 0; i < alumnos.length; i++) {
         for (let j = 0; j < alumnos[i].asignaturas.length; j++) {
         console.log(alumnos[i].asignaturas[j].toString());
             if (alumnos[i].asignaturas[j].toString() == id) {
             enviarmail("practicamariomail@gmail.com", alumnos[i].email, "Edición Software", `Software de la asignatura ${asignatura.nombre} ha sido editado`);
             }
         }
     }
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

router.post('/miasignatura/editsoftware/upload/:id/:index', async (req, res) => {
    try {
        let EDFile = req.files.file;
        const { id, index } = req.params;

        //Uso de mailer
        const usu = new Usuario();
        const alumnos = await usu.findRol("Alumno");
        const asig = new Asignatura();
        const asignatura = await asig.findById({ _id: id });

        for (let i = 0; i < alumnos.length; i++) {
            for (let j = 0; j < alumnos[i].asignaturas.length; j++) {
            console.log(alumnos[i].asignaturas[j].toString());
                if (alumnos[i].asignaturas[j].toString() == id) {
                enviarmail("practicamariomail@gmail.com", alumnos[i].email, "Edición Software", `Software de la asignatura ${asignatura.nombre} ha sido editado`);
                }
            }
        }

        EDFile.mv(`./files/softwares/${EDFile.name}`, async (err) => {
            const asignatura = await Asignatura.findById(id);
            if (!asignatura) {
                return res.status(404).send({ message: 'Asignatura no encontrada' });
            }
            asignatura.software[index] = `./files/softwares/${EDFile.name}`;
            await asignatura.save();

            res.redirect("/miasignatura/" + id);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor' });
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

    //Uso de mailer
    const usu = new Usuario();
    const alumnos = await usu.findRol("Alumno");

    for (let i = 0; i < alumnos.length; i++) {
        for (let j = 0; j < alumnos[i].asignaturas.length; j++) {
        console.log(alumnos[i].asignaturas[j].toString());
            if (alumnos[i].asignaturas[j].toString() == id) {
            enviarmail("practicamariomail@gmail.com", alumnos[i].email, "Software añadido", `Software de la asignatura ${asignatura.nombre} ha sido añadido`);
            }
        }
    }

    asignatura.software.push(software);

    await asignatura.update(id, asignatura);
    res.redirect("/miasignatura/" + id);
});

// router.post('/miasignatura/addsoftware/:id/upload',(req,res) => { 
//     let EDFile = req.files.file 
//     const { id } = req.params;
//     EDFile.mv(`./files/softwares${EDFile.name}`,err => { 
//     if(err) return res.status(500).send({ message : err }) 
//     return res.status(200).send({ message : 'File upload' }) 
//     }) 
//     res.redirect("/miasignatura/" + id);
//     });


router.post('/miasignatura/addsoftware/upload/:id', async (req, res) => {
    try {
        let EDFile = req.files.file;
        const { id } = req.params;

         //Uso de mailer
        const usu = new Usuario();
        const alumnos = await usu.findRol("Alumno");
        const asig = new Asignatura();
        const asignatura = await asig.findById({ _id: id });

        for (let i = 0; i < alumnos.length; i++) {
            for (let j = 0; j < alumnos[i].asignaturas.length; j++) {
            console.log(alumnos[i].asignaturas[j].toString());
                if (alumnos[i].asignaturas[j].toString() == id) {
                enviarmail("practicamariomail@gmail.com", alumnos[i].email, "Software añadido", `Software de la asignatura ${asignatura.nombre} ha sido añadido`);
                }
            }
        }

        EDFile.mv(`./files/softwares/${EDFile.name}`, async (err) => {
            if (err) {
                return res.status(500).send({ message: err });
            } else {
                const asignatura = await Asignatura.findById(id);
                if (!asignatura) {
                    return res.status(404).send({ message: 'Asignatura no encontrada' });
                }
                asignatura.software.push(`./files/softwares/${EDFile.name}`);
                await asignatura.save();
                res.redirect("/miasignatura/" + id);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
});

router.post('/sugerencia', isAuthenticated, async (req, res) => {
    try {
        const suge = new Sugerencia();
        suge.mail = req.user.email;
        suge.contenido = req.body.sugerencia;
        suge.fecha = Date.now();

        await suge.save();
        const usuario = new Usuario();
        const administradores = await usuario.findRol("Administrador");

        for (let i = 0; i < administradores.length; i++) {
            enviarmail("practicamariomail@gmail.com", administradores[i].email, "Sugerencia", suge.contenido);
        }
        
        const enviado = true;
        res.render('elements/buzon', {
            enviado: enviado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al guardar la sugerencia' });
    }
});


router.post('/miasignatura/mail', isAuthenticated, async (req, res, next) => {

    enviarmail("raul@gmail.com", "ibravmben55@gmail.com", "prueba", "hola aaaaaaa");


});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/");
}
module.exports = router;
