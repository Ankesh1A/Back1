const express = require('express');
const { paymentcreate, paymentverify } = require('../controller/payment.controller.js');
const router = express.Router();

// router.get('/', (req, res) => {
//     res.render('index');
// });

router.post('/paymentcreate',paymentcreate);





router.post('/paymentverify', paymentverify);


module.exports = router;

