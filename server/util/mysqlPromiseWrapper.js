// Returns a wrapper for the mysql connection to be used as a promise
module.exports = function(mysqlConnection) {
  return (query, parameters) => {
    parameters = parameters || [];
    return new Promise((resolve, reject) => {
      mysqlConnection.query(query, parameters, function (error, results, fields) {
        if (error) {
          reject(error);
        }
        else{
          resolve(results);
        }
      });
    });
  }
};
