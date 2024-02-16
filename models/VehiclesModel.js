const DbService = require("../services/DbService");
const dbInstance = DbService().getDBInstance().instance;

async function insertParkedVehicle({ plateNumber, slotId, size, entryDate }) {
  const result = await new Promise(function (resolve, reject) {
    const vehicleStatement = dbInstance.prepare(
      `INSERT INTO vehicles VALUES (?, ?, ?, ?, ?, ?)`,
    );

    vehicleStatement.run(plateNumber, slotId, size, entryDate, null, null);

    vehicleStatement.finalize((err) => {
      if (err) {
        console.error(err.message);

        reject(err);
      }
      console.log("Data inserted into vehicles table.");

      resolve({ plateNumber, slotId, size, entryDate });
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
      `SELECT * FROM vehicles WHERE plateNumber = '${plateNumber}'`,
      function (err, rows) {
        if (err) {
          reject(err);
        }

        resolve(rows);
      },
    );
  });

  dbInstance.each(`SELECT * FROM fees`, (err, row) => {
    console.log(row);
  });

  return result;
}

async function updateParkedVehicleExitDateTime(plateNumber, exitDate) {
  const result = await new Promise(function (resolve, reject) {
    dbInstance.run(
      "UPDATE vehicles SET exitDate = $exitDate WHERE plateNumber = $plateNumber",
      {
        $plateNumber: plateNumber,
        $exitDate: exitDate,
      },
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
  updateParkedVehicleExitDateTime,
};
