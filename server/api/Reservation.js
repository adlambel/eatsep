const router = require('express').Router();
const mongoose = require('mongoose');

const DishDate = mongoose.model('DishDate');
const Reservation = mongoose.model('Reservation');
const User = mongoose.model('User');

router.param('reservation', function (req, res, next, id) {

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.sendStatus(422);
    }

    Reservation.findById(id)
        .populate('dishDate')
        .populate('user')
        .then(function (todo) {
            if (!reservation) { return res.sendStatus(404); }
            req.reservation = reservation;

            return next();
        });
});

router.get('/', (req, res) => {

    Reservation.find()
        .populate({path: 'dishDate',
                   populate: { path: 'dish', model: 'Dish' }})
        .populate('user')
        .then((reservations) => {
            if (!reservations) { return res.sendStatus(404); }

            return res.json({
                reservations: reservations.map((dish) => {
                    return dish.toDto();
                })
            }).status(200);
        });
});

router.post('/', (req, res) => {
    // console.log(req)
    if (!req.body.dishDate || !req.body.user ) {
        res.sendStatus(422);
    }

    let reservation = new Reservation();
    reservation.dishDate = req.body.dishDate;
    reservation.user = req.body.user;
    reservation.comment = req.body.comment;
    reservation.isAccepted = req.body.isAccepted;

    reservation.save().then(() => {
        res.json(reservation.toDto()).status(201)
    })
});

router.put('/', (req, res) => {

    if (!req.body.id) {
        res.sendStatus(422);
    }

    Reservation.findById(req.body.id).then((reservation) => {
        reservation.isAccepted = req.body.isAccepted;

        reservation.save().then(() => {
            res.json(reservation.toDto()).status(200);
        })
    })
});

router.delete('/:reservation', (req, res) => {
    req.reservation.remove().then(function () {
        return res.sendStatus(200);
    });
});

module.exports = router;




