const DbService = require("../services/DbService");
const dbInstance = DbService().getDBInstance().instance;

async function getAvailableSlotsByType(vehicleType) {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.all(
      `
      SELECT
        id,
        isAvailable,
        type,
        distanceFromEntryPoint
      FROM slots WHERE isAvailable = 1 AND type >= ${vehicleType}
      `,
      function (err, rows) {
        console.log("getAvailableSlotsByType", rows);

        if (err) {
          reject(err);
        }

        resolve(rows);
      },
    );
  });

  console.log("getAvailableSlotsByType");

  dbInstance.each(`SELECT * FROM slots`, (err, row) => {
    console.log(row);
  });

  return result;
}

async function getSlotDetails(slotId) {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.all(
      `
      SELECT
        id,
        isAvailable,
        type,
        distanceFromEntryPoint
      FROM slots
      WHERE id = '${slotId}'
      `,
      function (err, rows) {
        console.log("getSlotDetails", rows);

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
      `UPDATE slots SET isAvailable = ${isAvailable} WHERE id = ${slotId}`,
      function (result, err) {
        if (err) {
          reject(err);
        }

        resolve(result);
      },
    );
  });

  console.log("updateSlotAvailability");

  dbInstance.each(`SELECT * FROM slots`, (err, row) => {
    console.log(row);
  });

  return result;
}

module.exports = {
  getAvailableSlotsByType,
  getSlotDetails,
  updateSlotAvailability,
};
