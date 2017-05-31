module.exports = (mysql) => {
  const router = require('express').Router();
  const appConfig = require('./appConfig.js')(mysql);

  router.post('/', function (req, res) {
    const body = req.body;
    const expectedArguments = [body.client, body.version, body.key];

    assertStrings(...expectedArguments).then(() =>
      appConfig.addConfig(...expectedArguments, body.value)
    )
    .then(data => res.status(201).end())
    .catch(errorThrower(res));
  });

  router.get('/:client/:version', function (req, res) {
    const lastId = parseEtag(req.headers['if-none-match']);

    assertStrings(req.params.client, req.params.version)
    .then(() => appConfig.getConfigsSinceId(req.params.client, req.params.version, lastId))
    .then(data => {
      if (data.highestId === 0) {
        res.status(304);
        res.end();
      }
      else {
        res.set('ETag', `W/"${data.highestId}"`);
        res.json(data.configs);
      }
    })
    .catch(errorThrower(res));
  });

  return router;
};

// Catch a promise, print the error and return specified error code or 500
const errorThrower = res => data => {
  if (data && data.code) {
    res.status(data.code).end();
  }
  else {
    console.error(data);
    res.status(500).end();
  }
};

const assertStrings = (...strings) => {
  for (let string of strings) {
    if (typeof string !== "string" || string.length === 0) {
      return Promise.reject({code: 400});
    }
  }
  return Promise.resolve();
};

// Parse the an weak etag to an integer, W/"123" => 123. Or return zero if failing
const parseEtag = etag => {
  if (etag) {
    let match = etag.match(/^W\/"([0-9]+)"$/);
    return match ? match[1] : 0;
  }
  return 0;
};
