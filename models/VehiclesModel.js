const DbService = require("../services/DbService");
const dbInstance = DbService().getDBInstance().instance;

async function insertParkedVehicle({ plateNumber, slotId, type, entryDateTime }) {
  const result = await new Promise(function (resolve, reject) {
    const vehicleStatement = dbInstance.prepare(
      `INSERT INTO vehicles VALUES (?, ?, ?, ?, ?, ?)`,
    );

    vehicleStatement.run(plateNumber, slotId, type, entryDateTime, null, null);

    vehicleStatement.finalize((err) => {
      if (err) {
        console.error(err.message);

        reject(err);
      }

      console.log("Data inserted into vehicles table.");

      resolve({ plateNumber, slotId, type, entryDateTime });
    });
  });

  dbInstance.each(`SELECT * FROM vehicles`, (err, row) => {
    console.log(row);
  });

  return result;
}

async function getParkedVehicleDetails(plateNumber) {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.all(
      `
      SELECT
        plateNumber,
        slotId,
        type,
        entryDateTime,
        exitDateTime,
        paidFee
      FROM vehicles
      WHERE plateNumber = '${plateNumber}'
      ORDER BY entryDateTime DESC
      LIMIT 1
      `,
      function (err, rows) {
        console.log("getParkedVehicleDetails", rows);

        if (err) {
          reject(err);
        }

        resolve(rows);
      },
    );
  });

  return result;
}

async function updateParkedVehicleExitDateTimeAndFee(plateNumber, parkingFee, exitDate) {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.run(
      `
      UPDATE vehicles
      SET exitDate = ${exitDate}, paidFee = ${parkingFee}
      WHERE plateNumber = ${plateNumber}
      `,
      function (result, err) {
        if (err) {
          reject(err);
        }

        resolve(result);
      },
    );
  });

  dbInstance.each(`SELECT * FROM vehicles`, (err, row) => {
    console.log(row);
  });

  return result;
}

module.exports = {
  insertParkedVehicle,
  getParkedVehicleDetails,
  updateParkedVehicleExitDateTimeAndFee,
};
