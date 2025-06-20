const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Provider = require('../models/indprovider');
const checkAuth = require('../middleware/check-auth');

//GET Routes

//Gets all providers (omit password)
router.get('/', async (req, res, next) => {
  try {
    const providers = await Provider.find()
      .lean()
      .select('-password -__v');

    res.status(200).json({ count: providers.length, providers });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

//Returns provider whose ID matches the one in the request
router.get('/:providerId', async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.providerId)
      .lean()
      .select('-password -__v');

    if (!provider) {
      return res.status(500).json({ message: 'Provider not found' });
    }

    res.status(200).json(provider);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }

});

//Creates a new independent provider
router.post('/signup', async (req, res, next) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const exists = await Provider.exists({ email });

    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }


    const hash = await bcrypt.hash(req.body.password, 10);

    const provider = new Provider({
      email: req.body.email,
      password: hash,
      phone: req.body.phone,
      birthdate: req.body.birthdate,
      address: req.body.address,
      serviceType: req.body.serviceType,
      bio: req.body.bio,
      availability: req.body.availability
    });

    //Save to db and wait for result
    const result = await provider.save();

    //Strip password before sending back
    const { password: _, __v: __, ...sanitized } = result.toObject();
    res.status(201).json({
      message: 'Provider created',
      createdProvider: sanitized
    });
  }

  catch (err) {
    console.error(err);
    // duplicate email → 409 Conflict
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ error: err });
  }
})

//Logs in an independent provider
router.post('/login', async (req, res) => {
  try {

    const email = (req.body.email || '').toLowerCase().trim();
    const password = req.body.password || '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const provider = await Provider
      .findOne({ email })
      .select('+password')           // pull the hash only for comparison
      .lean();                       // plain JS object, not a Mongoose doc

    if (!provider) {
      return res.status(401).json({ message: 'Auth failed' });
    }

    // Verify password
    const match = await bcrypt.compare(password, provider.password);
    if (!match) {
      return res.status(401).json({ message: 'Auth failed' });
    }

    const token = jwt.sign(
      {
        providerId: provider._id,
        email: provider.email,
        role: 'provider'             // you can use this in checkAuth
      },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    const { password: _, ...safeProvider } = provider;   // discard hash

    res.status(200).json({
      message: 'Auth successful',
      token: token,
      provider: safeProvider
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});



//Deletes indp provider with that specific ID
router.delete('/:providerId', checkAuth, (req, res, next) => {
  Provider.deleteOne({ _id: req.params.providerId })
    .exec()
    .then(result => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.status(200).json({
        message: 'Provider deleted',
        result
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
