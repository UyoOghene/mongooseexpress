const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: [true, 'price must be added'],
        min: 0
    },
    category: {
        type: String,
        enum: ['fruit', 'vegetable', 'dairy', 'fungi'],
        lowercase: true
    },
    farm: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm'
    }]
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
