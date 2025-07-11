const express = require("express");
const router = express.Router();
const userController = require('../controller/userController');
const tweeterController = require('../controller/tweeterController');
const auth = require('../middelware/auth');


router.get('/', auth.checkIfUserLoggedIn, userController.renderSignupPage);
router.post('/', userController.signup);
router.post('/login', userController.login);
router.get('/tweet', auth.checkIfUserNotLogin, tweeterController.dashboard);
router.get('/logout', userController.logout);

router.get('/addTweet', auth.checkIfUserNotLogin, tweeterController.addTweetPage);
router.post('/addTweet', auth.checkIfUserNotLogin, tweeterController.addTweetForm);
router.get('/tweet/:id', tweeterController.showTweet);
router.get('/delete/tweet/:id', tweeterController.deleteTweet);
router.get('/tweet/edit/:id', tweeterController.editTweetPage);
router.post('/tweet/edit/:id', tweeterController.editTweetForm);

router.get('/{*any}', tweeterController.notFoundPage);

module.exports = router;