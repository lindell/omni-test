module.exports = (mysql) => {
  const mysqlQuery = require('../util/mysqlPromiseWrapper.js')(mysql);

  function addConfig(client, version, key, value) {
    return getConfig(client, version, key).then(currentValue => {
      if (currentValue) {
        return updateConfig(client, version, key, value);
      }
      else {
        return insertConfig(client, version, key, value);
      }
    });
  }

  // Return {configs, highestId} where configs is an object with all configs
  // since the specified id and highestId is the latest id
  function getConfigsSinceId(client, version, fromId) {
    return mysqlQuery(
      `SELECT key_name, value, config_id
       FROM configs WHERE client_name = ? AND version = ? AND config_id > ?`,
      [client, version, fromId]
    )
    .then(data => ({
      configs: keyValuePairsToObject(data),
      highestId: highestId(data),
    }));
  }

  function getConfigs(client, version) {
    return getConfigsSinceId(client, version, 0);
  }

  function getLatestId(client, version) {
    return mysqlQuery(
      `SELECT config_id FROM configs
       WHERE client_name = ? AND version = ?
       ORDER BY config_id DESC LIMIT 1`,
      [client, version]
    ).then(data => data.length !== 0 ? data[0].config_id : false);
  }

  function getConfig(client, version, key) {
    return mysqlQuery(
      `SELECT value FROM configs
       WHERE client_name = ? AND version = ? AND key_name = ?
       LIMIT 1`,
      [client, version, key]
    ).then(data => data.length !== 0 ? data[0].value : false);
  }

  function insertConfig(client, version, key, value) {
    return getLatestId(client, version)
      .then(configId => mysqlQuery(
        `INSERT INTO configs (client_name,version,key_name,value,config_id)
         VALUES (?,?,?,?,?)`,
        [client, version, key, value, configId + 1]
      ));
  }

  // What happens in when a key is re-set is not defined in the Specification
  // but replacing seems like the most reasonable outcome
  function updateConfig(client, version, key, value) {
    return getLatestId(client, version)
      .then(configId => mysqlQuery(
        `UPDATE configs
         SET value = ?, config_id = ?
         WHERE client_name = ? AND version = ? AND key_name = ?`,
        [value, configId + 1, client, version, key]
      ));
  }

  return {addConfig, getConfigs, getConfigsSinceId};
}




// Takes an array of {key_name: key_name, value: value} and combines them into
// {key_name: value}
const keyValuePairsToObject = data => data.reduce((configs, configPair) => {
    let config = {};
    config[configPair.key_name] = configPair.value;
    return Object.assign(config, configs);
  }, {});

const highestId = data => data.reduce((max, config) => Math.max(max, config.config_id), 0);
