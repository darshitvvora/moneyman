const {
    Stock,
} = require('../../conn/sqldb');
const stockService = require('./stock.service');

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
 * Get list of stock
 *
 */
function index(req, res) {
    return Stock.findAll({
        attributes: [
            'id',
            'name',
            'exchange',
            'symbol'
        ]
    })
        .then(stocks => {
            res.status(200).json(stocks);
        })
        .catch(handleError(res));
}

/**
 * Creates a new stock
 */
function create(req, res) {
    const newStock = Stock.build(req.body);
    return newStock.save()
        .then(function(stock) {
            return res.json(stock);
        })
        .catch(validationError(res));
}

/**
 * Get a single stock
 */
function show(req, res, next) {
    const stockId = req.params.id;
    return Stock.find({
        where: {
            id: stockId
        }
    })
        .then(stock => {
            if(!stock) {
                return res.status(404).end();
            }
            res.json(stock);
        })
        .catch(err => next(err));
}

/**
 * Deletes a stock
 *
 */
function destroy(req, res) {
    return Stock.destroy({ where: { id: req.params.id } })
        .then(function() {
            res.status(204).end();
        })
        .catch(handleError(res));
}

async function populateNSE500Data(req, res) {
    const data = await stockService.getDataForNSE500();
    return res.json(data);
}

module.exports = {
    index,
    create,
    show,
    destroy,
    populateNSE500Data,
};
