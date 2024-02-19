const DbService = require("../services/DbService");
const dbInstance = DbService().getDBInstance().instance;

async function getFees() {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.all(
      `
      SELECT
        feeName,
        vehicleType,
        hour,
        fee
      FROM fees
      `,
      function (err, rows) {
        console.log("getFees", rows);

        if (err) {
          reject(err);
        }

        resolve(rows);
      },
    );
  });

  return result;
}

module.exports = {
  getFees,
};
