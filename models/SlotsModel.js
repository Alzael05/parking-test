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
        console.debug("getAvailableSlotsByType", err, rows);

        if (err) {
          reject(err);
        }

        resolve(rows);
      },
    );
  });

  // DEBUG
  dbInstance.all(`SELECT * FROM slots`, (err, rows) => {
    console.debug("getAvailableSlotsByType");

    console.debug(err, rows);
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
        console.debug("getSlotDetails", err, rows);

        if (err) {
          reject(err);
        }

        resolve(rows);
      },
    );
  });

  return result;
}

async function updateSlotAvailability(slotId, isAvailable) {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.run(
      `UPDATE slots SET isAvailable = ${isAvailable} WHERE id = ${slotId}`,
      function (result, err) {
        console.debug("updateSlotAvailability", result, err);

        if (err) {
          reject(err);
        }

        resolve(result);
      },
    );
  });

  // DEBUG
  dbInstance.all(`SELECT * FROM slots`, (err, rows) => {
    console.debug("updateSlotAvailability");

    console.debug(err, rows);
  });

  return result;
}

module.exports = {
  getAvailableSlotsByType,
  getSlotDetails,
  updateSlotAvailability,
};
