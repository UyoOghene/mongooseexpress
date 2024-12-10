const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/product');
const Farm = require('./models/farm')
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

// app.get('/products', async (req, res, next) => {
// {  const {category} = req.query;
//     if (category){
//         const products = await Product.find({category});
//         res.render('products/index', { products, category });
//     }
//         const products = await Product.find({});
//         res.render('products/index', { products, category: 'All' });

  
    
// }});

function wrapAsync(fn){
    return function(req,res,next){
        fn(req,res,next).catch(e => next(e))
    }
}

// farm routes
app.get('/farms', async (req, res) => {
   const farms = await Farm.find({})
    res.render('farms/index', {farms});
});

app.get('/farms/new', (req, res) => {
    res.render('farms/new');
});

app.post('/farms',  async (req, res, next) => { 
    const farm = new Farm(req.body)
    await farm.save();
    res.redirect('/farms')
 });

 app.get('/farms/:id', async(req,res) =>{
    const { id } = req.params;
    const farm = await Farm.findById(id).populate('products')
    res.render('farms/show',{farm})
 }); 
 

 app.delete('/farms/:id', async(req,res) => {
    const {id} = req.params;
    const farm = await Farm.findByIdAndDelete(id);
    res.redirect('/farms');
 })

 app.get('/farms/:id/products/new', async (req,res) =>{
    const {id} = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new',{ categories, id, farm})
 });

 app.post('/farms/:id/products', async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    const {name, price, category} = req.body;
    const product = new Product({ name, price, category})
    farm.products.push(product);
    product.farm = farm;
    await farm.save();
    await product.save();
    // res.send(farm);
    res.redirect(`/farms/${farm._id}`)
 });
 

// Product routes
app.get('/products', wrapAsync( async (req, res, next) => {
    
        const { category } = req.query;

        if (category) {
            const products = await Product.find({ category });
            return res.render('products/index', { products, category }); // `return` ensures the rest of the code doesn't execute
        }

        const products = await Product.find({});
        res.render('products/index', { products, category: 'All' });
    
    
}));


// Add a new product form - this should come before the `/:id` route
app.get('/products/new', (req, res) => {
    res.render('products/new',{categories});
});

app.post('/products', wrapAsync (async (req, res, next) => { 
   const newProduct = new Product(req.body);
        await newProduct.save();
        res.redirect(`/products/${newProduct._id}`);
    
}));

app.get('/products/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        res.render('products/show', { product });
    } catch (e) {
        next(e);
    }
});


app.get('/products/:id/edit', async (req, res, next) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id); // Await the result
        if (!product) {
            return next(new AppError('Product not found', 404)); // Handle case where product doesn't exist
        }
        res.render('products/edit', { product, categories });
    } catch (e) {
        next(e); // Pass errors to the error-handling middleware
    }
});

app.put('/products/:id', async (req, res,next) => {
    try{
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
        res.redirect(`/products/${product._id}`);
        console.log(req.body);
    
    }
    catch(e) {
        next(e)
    }
});

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
});
const handleValidatnErr = (err)=>{
    console.log(err)
    return new AppError(`validation failed : ${err.message}`,400);
}

app.use((err,req,res,next)=>{
    console.log(err.name)
    if (err.name === 'ValidationError') err= handleValidatnErr(err)
        next(err)
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).send(message);
});



app.listen(3000, () => {
    console.log('App is listening on port 3000');
});
