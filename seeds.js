const mongoose = require('mongoose');

const Product = require('./models/product');
const { name } = require('ejs');

mongoose.connect('mongodb://localhost:27017/farmStand')
    .then(() => {
        console.log('mongo connection open');
    })
    .catch(err => {
        console.log('mongo oh no error!');
        console.log(err);
    });
    321 

const p = new Product({
    name: 'Ruby Grapefruit',
    price: 1.99,
    category: 'fruit'
})
p.save()
    .then(p =>{
        console.log(p)
    } )
    .catch(error => {
        console.log(error)
    })

    const seedProducts = [
        {
            name: 'Ruby Grapefruit',
            price: 1.99,
            category: 'fruit'
        
        },
        {
            name: 'fairy eggplant',
            price: 3.99,
            category: 'vegetable'
        
        },
        {
            name: 'Red Apple',
            price: 2.09,
            category: 'fruit'
        
        },
        {
            name: 'Green celery',
            price: 9,
            category: 'vegetable'
        
        },
        {
            name: 'organic seedless watermelon',
            price: 3.9,
            category: 'fruit'
        
        },
        {
            name: 'cardbury chocolate',
            price: 5,
            category: 'dairy'
        
        },
    ]

    // Product.insertMany(seedProducts)
    // .then(res => {
    //     console.log(res)
    // })
    // .catch(e => {
    //     console.log(e)
    // })