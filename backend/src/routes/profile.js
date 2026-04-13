const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/profileController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getProfile);
router.patch('/', ctrl.updateProfile);
router.patch('/password', ctrl.changePassword);

module.exports = router;
