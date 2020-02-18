const {
  Client,
} = require('../../conn/sqldb');
const config = require('../../config/environment');

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of client
 *
 */
function index(req, res) {
  return Client.findAll({
      attributes: [
        'id',
        'name',
        'type'
      ]
    })
.then(clients => {
    res.status(200).json(clients);
  })
    .catch(handleError(res));
}

/**
 * Creates a new client
 */
function create(req, res) {
const newClient = Client.build(req.body);
    return newClient.save()
.then(function(client) {
    return res.json(client);
  })
    .catch(validationError(res));
}

/**
 * Get a single client
 */
function show(req, res, next) {
  const clientId = req.params.id;
  return Client.find({
    where: {
      id: clientId
    }
  })
.then(client => {
    if (!client) {
      return res.status(404).end();
    }
    res.json(client);
  })
    .catch(err => next(err));
}

/**
 * Deletes a client
 *
 */
function destroy(req, res) {
  return Client.destroy({ where: { id: req.params.id } })
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
