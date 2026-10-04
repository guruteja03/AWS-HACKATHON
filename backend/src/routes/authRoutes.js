const express = require('express');
const { demoLogin } = require('../controllers/authController');

const router = express.Router();
router.post('/demo-login', demoLogin);

module.exports = router;
