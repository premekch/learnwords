const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studyController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/cards', ctrl.getCards);
router.post('/review', ctrl.submitReview);

module.exports = router;
