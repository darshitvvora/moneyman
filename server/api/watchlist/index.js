const express = require('express');
const controller = require('./watchlist.controller');

const router = express.Router();

router.get('/', controller.index);
router.delete('/:id', controller.destroy);
router.get('/:id', controller.show);
router.post('/', controller.create);
module.exports = router;
