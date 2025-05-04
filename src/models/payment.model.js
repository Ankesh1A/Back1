const mongoose = require('mongoose');

const paymentModel = mongoose.Schema({
    paymentId:{
        type:String,
    },
    name:String,
    adhar:String,
    email:String,
    addres:String,
    orderId:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    signature:{
        type:String,
    },
    currency:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:'pending',
    }

},{timestamps:true});
module.exports= mongoose.model("payment",paymentModel);