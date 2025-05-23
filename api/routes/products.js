const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');

router.get('/', (req, res, next) => {

    Product.find({})
    .select('name price _id')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs
        }
        console.log(response);
        res.status(200).json({response});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    })
    
});


router.get('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.findById(id)
    .exec()
    .then(doc => {
        console.log(doc);
        res.status(200).json({doc})
    })
    .catch(err =>
        {
            console.log(err)
            res.status(500).json({error: err});
        }  
    );
    
})

router.post('/', checkAuth, (req, res, next) => {


    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price  
    });

    //Stores version of this model in the database
    product.save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Handling POST requests to /products',
            createdProduct: result
        });
    }) 
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    });
    
    res.status(201).json({
        message: 'Handling POST requests to /products',
        createdProduct: product,
    });
});

//Delete a product
router.delete('/:productID', (req, res, enxt) => {
   
    const id = req.params.productID;

    //This removes any property in our database that has the id specified in the URL
    Product.deleteOne({_id: id})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    }) 

})




module.exports = router;


