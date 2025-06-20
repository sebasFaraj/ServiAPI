const express = require('express');
const router = express.Router();
const Bookings = require('../models/booking');
const checkAuth = require('../middleware/check-auth');


//GET Routes

//Gets all the bookings
router.get('/', async (req, res, next) => {
    try {
        const bookings = await Bookings.find()
            .lean()
        //.select('') Can be re-added in case information needs to be excluded

        res.status(200).json({ count: bookings.length, bookings });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

router.get('/:bookingID', async (req, res, next) => {
    try {
        const booking = await Bookings.findById(req.params.bookingID)
            .lean()
        //.select()

        if (!booking) {
            res.status(500).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: "Booking Found", booking });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

//Gets all bookings related to a userID
router.get('/users/:userID', async (req, res, next) => {
    try {
        const bookings = await Bookings.find({ client: req.params.userID })
            .lean()
        //.select()

        if (!bookings) {
            return res.status(500).json({ message: "No bookings under this User" })
        }

        res.status(200).json({ count: bookings.count, bookings });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

//Gets all bookings related to a providerID
router.get('/providers/:providerID', async (req, res, next) => {
    try {
        const bookings = await Bookings.find({ provider: req.params.providerID })
            .lean()
        //.select()

        if (!bookings) {
            res.status(500).json({ message: "No bookings found under this Provider" })
        }

        res.status(200).json({ count: bookings.count, bookings });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

//POST Routes 
router.post('/newBooking', async (req, res, next) => {
    try {
        const booking = new Bookings({
            provider: req.body.providerID,
            client: req.body.userID,
            bookingDuration: req.body.bookingDuration,
            status: req.body.status,
            price: req.body.price,
            carPreference: req.body.carPreference,
            clientRating: req.body.clientRating,
            scheduled: req.body.scheduled,
            scheduledStartTime: req.body.scheduledStartTime,
            scheduledEndTime: req.body.scheduledEndTime,
            actualStartTime: req.body.actualStartTime,
            actualEndTime: req.body.actualEndTime,
            distance: req.body.distance
        })

        const result = await booking.save();

        //TODO: Add sanitzation
        res.status(201).json({ message: "Booking Created", booking });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

//DELETE Routes
router.delete("/removeBooking/:bookingID", async (req, res, next) => {
    try {
        const result = await Bookings.deleteOne({ _id: req.params.bookingID });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({
            message: "Booking deleted",
            result
        });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

//PATCH Routes

//Accept
router.patch('/accept/:bookingID', async (req, res, next) => {
    try {
        const result = await Bookings.updateOne({ _id: req.params.bookingID }, { status: 'Accepted' });

        if (result.matchedCount <= 0) {
            res.status(500).json({ message: "Can't find Booking" });
        }

        else if (result.modifiedCount <= 0) {
            res.status(500).json({ message: "Can't update Booking" });
        }

        res.status(200).json({ message: "Booking Accepted", result });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

//In Progress
router.patch('/inProgress/:bookingID', async (req, res, next) => {
    try {
        const result = await Bookings.updateOne({ _id: req.params.bookingID }, { status: 'InProgress' });

        if (result.matchedCount <= 0) {
            res.status(500).json({ message: "Can't find Booking" });
        }

        else if (result.modifiedCount <= 0) {
            res.status(500).json({ message: "Can't update Booking" });
        }

        res.status(200).json({ message: "Booking In Progress", result });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});


//Completed
router.patch('/completed/:bookingID', async (req, res, next) => {
    try {
        const result = await Bookings.updateOne({ _id: req.params.bookingID }, { status: 'Completed' });

        if (result.matchedCount <= 0) {
            res.status(500).json({ message: "Can't find Booking" });
        }

        else if (result.modifiedCount <= 0) {
            res.status(500).json({ message: "Can't update Booking" });
        }

        res.status(200).json({ message: "Booking Completed", result });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

//Cancelled
router.patch('/cancelled/:bookingID', async (req, res, next) => {
    try {
        const result = await Bookings.updateOne({ _id: req.params.bookingID }, { status: 'Cancelled' });

        if (result.matchedCount <= 0) {
            res.status(500).json({ message: "Can't find Booking" });
        }

        else if (result.modifiedCount <= 0) {
            res.status(500).json({ message: "Can't update Booking" });
        }

        res.status(200).json({ message: "Booking Cancelled", result });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

//NoShow
router.patch('/noShow/:bookingID', async (req, res, next) => {
    try {
        const result = await Bookings.updateOne({ _id: req.params.bookingID }, { status: 'NoShow' });

        if (result.matchedCount <= 0) {
            res.status(500).json({ message: "Can't find Booking" });
        }

        else if (result.modifiedCount <= 0) {
            res.status(500).json({ message: "Can't update Booking" });
        }

        res.status(200).json({ message: "Booking set to No Show", result });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

module.exports = router;
