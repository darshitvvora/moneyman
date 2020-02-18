const express = require('express');
const controller = require('./stock.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/nse500', controller.populateNSE500Data);

router.delete('/:id', controller.destroy);
router.get('/:id', controller.show);
router.post('/', controller.create);

module.exports = router;
