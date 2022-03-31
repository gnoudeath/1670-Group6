const express = require('express');
const router = express.Router();

const profilesController = require('../controllers/profilesController');


// router.use('/:updateprofile', profilesController.show);
router.use('/', profilesController.index);


module.exports = router;