const router = require('express').Router();
const mongoose = require('mongoose');

const Dish = mongoose.model('Dish');
const User = mongoose.model('User');
const multer = require('multer');
// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../../uploads/images/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.png')
    }
})

var limits = { fileSize: 5 * 1024 * 1024, fieldSize: 5 * 1024 * 1024}

var upload = multer({storage: storage, limits: limits})

router.param('dish', function (req, res, next, id) {

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.sendStatus(422);
    }

    Dish.findById(id)
        .populate('user')
        .then(function (todo) {
            if (!dish) { return res.sendStatus(404); }

            req.dish = dish;

            return next();
        });
});

router.get('/', (req, res) => {

    Dish.find()
        .populate('user')
        .then((dishs) => {
            if (!dishs) { return res.sendStatus(404); }

            return res.json({
                dishs: dishs.map((dish) => {
                    return dish.toDto();
                })
            }).status(200);
        });
});

router.post('/', upload.single('dish'),(req, res) => {
    if (!req.body.title || !req.body.description ) {
        res.sendStatus(422);
    }
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a png file')
        error.httpStatusCode = 400
        return next(error)
    }
    const filename = file.filename
    let dish = new Dish();
    dish.title = req.body.title;
    dish.description = req.body.description;
    dish.images = filename;
    dish.ingredients = req.body.ingredients;
    dish.keywords = req.body.keywords;
    dish.categories = req.body.categories;
    dish.user = req.body.user;
    dish.mark = 0;
    dish.nbmark = 0;

    dish.save().then(() => {
        res.json(dish.toDto()).status(201);
    })

});

router.put('/', (req, res) => {

    if (!req.body.id) {
        res.sendStatus(422);
    }

    Dish.findById(req.body.id).then((dish) => {
        dish.title = req.body.title;
        dish.description = req.body.description;
        dish.images = req.body.images;
        dish.ingredients = req.body.ingredients;
        dish.keywords = req.body.keywords;
        dish.categories = req.body.categories;

        dish.save().then(() => {
            res.json(dish.toDto()).status(200);
        })
    })
});

router.delete('/:dish', (req, res) => {
    req.dish.remove().then(function () {
        return res.sendStatus(200);
    });
});

module.exports = router;




