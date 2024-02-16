const DbService = require("../services/DbService");
const dbInstance = DbService().getDBInstance().instance;

async function getAvailableSlotsBySize(vehicleSize) {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.all(
      `SELECT * FROM slots WHERE isAvailable = 1 AND size >= ${vehicleSize}`,
      function (err, rows) {
        if (err) {
          reject(err);
        }

        resolve(rows);
      },
    );
  });

  dbInstance.each(`SELECT * FROM slots`, (err, row) => {
    console.log(row);
  });

  return result;
}

async function updateSlotAvailability(slotId, isAvailable) {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.run(
      "UPDATE slots SET isAvailable = $isAvailable WHERE id = $id",
      {
        $id: slotId,
        $isAvailable: isAvailable,
      },
      function (result, err) {
        if (err) {
          reject(err);
        }

        resolve(result);
      },
    );
  });

  dbInstance.each(`SELECT * FROM slots`, (err, row) => {
    console.log(row);
  });

  return result;
}

module.exports = {
  getAvailableSlotsBySize,
  updateSlotAvailability,
};
