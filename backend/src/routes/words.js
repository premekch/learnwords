const express = require('express');
const multer = require('multer');
const router = express.Router();
const ctrl = require('../controllers/wordsController');
const auth = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/csv' ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.csv');
    if (allowed) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx and .csv files are allowed'));
    }
  },
});

router.use(auth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/import', upload.single('file'), ctrl.importFile);

module.exports = router;
