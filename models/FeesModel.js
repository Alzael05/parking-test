const DbService = require("../services/DbService");
const dbInstance = DbService().getDBInstance().instance;

async function getFees() {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.all(`SELECT * FROM fees`, function (err, rows) {
      if (err) {
        reject(err);
      }

      resolve(rows);
    });
  });

  // dbInstance.each(`SELECT * FROM fees`, (err, row) => {
  //   console.log(row);
  // });

  return result;
}

module.exports = {
  getFees,
};
