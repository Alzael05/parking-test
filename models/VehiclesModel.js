const DbService = require("../services/DbService");
const dbInstance = DbService().getDBInstance().instance;

async function insertParkedVehicle({ plateNumber, slotId, type, entryDateTime }) {
  const result = await new Promise(function (resolve, reject) {
    const vehicleStatement = dbInstance.prepare(
      `
      INSERT INTO vehicles (
        plateNumber,
        slotId,
        type,
        entryDateTime
      )
      VALUES (?, ?, ?, ?)
      `,
    );

    vehicleStatement.run(plateNumber, slotId, type, entryDateTime);

    vehicleStatement.finalize((err) => {
      if (err) {
        console.error(err.message);

        reject(err);
      }

      console.log("Data inserted into vehicles table.");

      resolve({ plateNumber, slotId, type, entryDateTime });
    });
  });

  dbInstance.all(`SELECT * FROM vehicles`, (err, rows) => {
    console.debug("insertParkedVehicle");

    console.debug(err, rows);
  });

  return result;
}

async function getParkedVehicleDetails(plateNumber) {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.all(
      `
      SELECT
        id,
        plateNumber,
        slotId,
        type,
        entryDateTime,
        exitDateTime,
        paidFee
      FROM vehicles
      WHERE plateNumber = '${plateNumber}'
      ORDER BY id DESC, entryDateTime DESC
      `,
      function (err, rows) {
        console.debug("getParkedVehicleDetails", err, rows);

        if (err) {
          reject(err);
        }

        resolve(rows);
      },
    );
  });

  return result;
}

async function updateParkedVehicleExitDateTimeAndFee(
  id,
  plateNumber,
  parkingFee,
  exitDate,
) {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.run(
      `
      UPDATE vehicles
      SET exitDateTime = '${exitDate}', paidFee = '${parkingFee}'
      WHERE id = '${id}' AND plateNumber = '${plateNumber}'
      `,
      function (result, err) {
        console.debug("updateParkedVehicleExitDateTimeAndFee", result, err);

        if (err) {
          reject(err);
        }

        resolve(result);
      },
    );
  });

  dbInstance.all(`SELECT * FROM vehicles`, (err, rows) => {
    console.debug("updateParkedVehicleExitDateTimeAndFee");

    console.debug(err, rows);
  });

  return result;
}

module.exports = {
  insertParkedVehicle,
  getParkedVehicleDetails,
  updateParkedVehicleExitDateTimeAndFee,
};
