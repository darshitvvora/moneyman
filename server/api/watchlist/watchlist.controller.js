const {
    Watchlist, Stock, User
} = require('../../conn/sqldb');

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
 * Get list of watchlist
 *
 */
function index(req, res) {
    return Watchlist.findAll({
        attributes: [
            'id',
            'name',
        ],
        include: [{
            model: Stock,
        }],
    })
        .then(stocks => {
            res.status(200).json(stocks);
        })
        .catch(handleError(res));
}

/**
 * Creates a new watchlist
 */
function create(req, res) {
    const newWatchlist = Watchlist.build(req.body);
    return newWatchlist.save()
        .then(function(watchlist) {
            return res.json(watchlist);
        })
        .catch(validationError(res));
}

/**
 * Get a single watchlist
 */
function show(req, res, next) {
    const wId = req.params.id;
    return Watchlist.find({
        where: {
            id: wId
        }
    })
        .then(watchlist => {
            if(!watchlist) {
                return res.status(404).end();
            }
            res.json(watchlist);
        })
        .catch(err => next(err));
}

/**
 * Deletes a watchlist
 *
 */
function destroy(req, res) {
    return Watchlist.destroy({ where: { id: req.params.id } })
        .then(function() {
            res.status(204).end();
        })
        .catch(handleError(res));
}

module.exports = {
    index,
    create,
    show,
    destroy,
};
