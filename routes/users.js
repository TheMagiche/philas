const express = require('express');
const router  = express.Router();
const {isAuthenticated, isAuthorized} = require('../middlewares/auth');
const {createUser, getAllUsers, getUser, updateUser, deleteUser } = require('../controllers/users');

// create a user
router.route('/').post(
    createUser
);
// lists all users
router.route('/').get( 
    isAuthenticated,
    isAuthorized(true, ["admin"]),
    getAllUsers
);
// get :id user
router.route('/user/:id').get(
    getUser
);
// updates :id user
router.route('/user/:id/update').patch(
    isAuthenticated,
    isAuthorized(true, ["admin","user","business"]),
    updateUser
);
// deletes :id user
router.route('/user/:id/delete').delete( 
    isAuthenticated,
    isAuthorized(true, ["admin","user","business"]),
    deleteUser
);


module.exports = router;