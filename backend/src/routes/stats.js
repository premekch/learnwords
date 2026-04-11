const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/statsController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getStats);
router.get('/activity', ctrl.getActivity);

module.exports = router;
