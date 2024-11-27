const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/product');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const AppError = require('./AppError')


mongoose.connect('mongodb://localhost:27017/farmStand2')
    .then(() => {
        console.log('Mongo connection open');
    })
    .catch(err => {
        console.log('Mongo connection error:', err);
    });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: true }));

const categories = ['fruit','vegetable','dairy','fungi']

app.get('/dogs', (req, res) => {
    res.send('Woof');
});

app.get('/products', async (req, res) => {
    const {category} = req.query;
    if (category){
        const products = await Product.find({category});
        res.render('products/index', { products, category });
    }else{
        const products = await Product.find({});
        res.render('products/index', { products, category: 'All' });

  
    }
});

// Add a new product form - this should come before the `/:id` route
app.get('/products/new', (req, res) => {
    res.render('products/new',{categories});
});

app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`);
});

app.get('/products/:id', (req, res, next) => {
    const { id } = req.params;

    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('Invalid Product ID', 400));
    }

    Product.findById(id)
        .then((product) => {
            if (!product) {
                return next(new AppError('Product not found', 404));
            }
            res.render('products/show', { product });
        })
        .catch(next); // Pass any unexpected errors to the error-handling middleware
});

app.get('/products/:id/edit', (req, res, next) => {
    const { id } = req.params;

    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('Invalid Product ID', 400));
    }

    // Find the product by ID
    Product.findById(id)
        .then((product) => {
            if (!product) {
                return next(new AppError('Product not found', 404));
            }
            res.render('products/edit', { product, categories });
        })
        .catch(next); // Pass unexpected errors to the error-handling middleware
});

app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/products/${product._id}`);
    console.log(req.body);
});

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
});

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).send(message);
});



app.listen(3000, () => {
    console.log('App is listening on port 3000');
});
