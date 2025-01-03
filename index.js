const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/product');
const Farm = require('./models/farm')
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')


mongoose.connect('mongodb://localhost:27017/farmStand2')
    .then(() => {
        console.log('Mongo connection open');
    })
    .catch(err => {
        console.log('Mongo connection error:', err);
    });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({secret: 'secret'}))
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
const categories = ['fruit','vegetable','dairy','fungi']

app.get('/dogs', (req, res) => {
    res.send('Woof');
});

app.get('/products', async (req, res) => {
    const {category} = req.query;
    const messages = req.flash('success');

    if (category){
        const products = await Product.find({category});
        res.render('products/index', { products, category,messages});
    }else{
        const products = await Product.find({});
        res.render('products/index', { products, category: 'All', messages});    }
});

// Add a new product form - this should come before the `/:id` route
app.get('/products/new', (req, res) => {
    res.render('products/new',{categories});
});

app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    req.flash('success','new prod')

    res.redirect(`/products/${newProduct._id}`);
});

app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const messages = req.flash('success');

    // Check if the id is a valid ObjectId
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send("Invalid Product ID");
    }
    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).send("Product Not Found");
    }
    res.render('products/show', { product, messages });
});
app.get('/products/:id/edit',async (req,res) =>{
   const {id} = req.params;
   const product = await Product.findById(id);

   res.render('products/edit', {product, categories}) 
})

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
