const {
    User,
} = require('../../conn/sqldb');
const config = require('../../config/environment');
const jwt = require('jsonwebtoken');


function validationError(res, statusCode) {
    statusCode = statusCode || 422;
    return function(err) {
        return res.status(statusCode).json(err);
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        return res.status(statusCode).send(err);
    };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
function index(req, res) {
    return User.findAll({
        attributes: [
            'id',
            'name',
            'email'
        ]
    })
        .then(users => {
            res.status(200).json(users);
        })
        .catch(handleError(res));
}

/**
 * Creates a new user
 */
function create(req, res) {
    const newUser = User.build(req.body);
    newUser.setDataValue('role', 'user');
    return newUser.save()
        .then(function(user) {
            const token = jwt.sign({ id: user._id }, config.secrets.session, {
                expiresIn: 60 * 60 * 5
            });
            res.json({ token });
        })
        .catch(validationError(res));
}

/**
 * Get a single user
 */
function show(req, res, next) {
    const userId = req.params.id;
    return User.find({
        where: {
            id: userId
        }
    })
        .then(user => {
            if(!user) {
                return res.status(404).end();
            }
            res.json(user.profile);
        })
        .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
function destroy(req, res) {
    return User.destroy({ where: { id: req.params.id } })
        .then(function() {
            res.status(204).end();
        })
        .catch(handleError(res));
}

/**
 * Change a users password
 */
function changePassword(req, res) {
    const userId = req.user.id;
    const oldPass = String(req.body.oldPassword);
    const newPass = String(req.body.newPassword);

    return User.find({
        where: {
            id: userId
        }
    })
        .then(user => {
            if(user.authenticate(oldPass)) {
                user.password = newPass;
                return user.save()
                    .then(() => {
                        res.status(204).end();
                    })
                    .catch(validationError(res));
            } else {
                return res.status(403).end();
            }
        });
}

/**
 * Get my info
 */
function me(req, res, next) {
    const userId = req.user.id;

    return User.find({
        where: {
            id: userId
        },
        attributes: [
            'id',
            'name',
            'email',
            'role',
        ]
    })
        .then(user => { // don't ever give out the password or salt
            if(!user) {
                return res.status(401).end();
            }
            return res.json(user);
        })
        .catch(err => next(err));
}

/**
 * Authentication callback
 */
function authCallback(req, res) {
    res.redirect('/');
}

module.exports = {
    index,
    create,
    show,
    destroy,
    changePassword,
    me,
    authCallback
};
