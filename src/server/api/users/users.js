const router = require('express').Router();
const controller = require('./users.ctrl.js');

router.get('/:id', controller.getOne);
router.get('/', controller.getAll);
router.get('/search', controller.getSearch);


router.post('/', controller.post);

module.exports = router;