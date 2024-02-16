const util = require("node:util");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database.");
});

function DbLibrary() {
  function initialize() {
    db.serialize(() => {
      // Create slots table
      db.run(
        `
        CREATE TABLE slots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          isAvailable BOOLEAN NOT NULL CHECK(isAvailable IN (0,1)),
          size INTEGER CHECK(size IN (0,1,2)),
          distanceFromEntryPoint TEXT
        )
        `,
        (err) => {
          if (err) {
            return console.error(err.message);
          }

          console.log("Slots table created.");
        },
      );

      const parkingMap = [
        {
          size: 0, // "S",
          distanceFromEntryPoint: [5, 10, 6],
        },
        {
          size: 1, // "M",
          distanceFromEntryPoint: [4, 9, 7],
        },
        {
          size: 2, // "L",
          distanceFromEntryPoint: [3, 8, 8],
        },
        {
          size: 0, // "S",
          distanceFromEntryPoint: [2, 7, 9],
        },
        {
          size: 1, // "M",
          distanceFromEntryPoint: [1, 6, 10],
        },
        {
          size: 2, // "L",
          distanceFromEntryPoint: [6, 1, 5],
        },
        {
          size: 0, // "S",
          distanceFromEntryPoint: [9, 4, 2],
        },
        {
          size: 1, // "M",
          distanceFromEntryPoint: [8, 3, 3],
        },
        {
          size: 2, // "L",
          distanceFromEntryPoint: [7, 2, 4],
        },
        {
          size: 1, // "M",
          distanceFromEntryPoint: [10, 5, 1],
        },
        // Add more rows for additional slots
      ];
      const slotsStatement = db.prepare(`INSERT INTO slots VALUES (?, ?, ?, ?)`);

      for (let index = 0; index < parkingMap.length; index++) {
        slotsStatement.run(
          index + 1,
          1, // available
          parkingMap[index].size,
          JSON.stringify(parkingMap[index].distanceFromEntryPoint),
        );
      }

      slotsStatement.finalize((err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log("Data inserted into slots table.");
      });

      db.each(`SELECT * FROM slots`, (err, row) => {
        console.log(row);
      });

      // Create vehicles table
      db.run(
        `
        CREATE TABLE vehicles (
          plateNumber TEXT NOT NULL,
          slotId INTEGER NOT NULL,
          size INTEGER NOT NULL CHECK(size IN (0,1,2)),
          entryDateTime TEXT NOT NULL,
          exitDateTime TEXT DEFAULT NULL,
          paidAmount REAL DEFAULT NULL
        )
        `,
        (err) => {
          if (err) {
            return console.error(err.message);
          }

          console.log("vehicles table created.");
        },
      );

      // Create fees table
      db.run(
        `
        CREATE TABLE fees (
          name TEXT,
          vehicleType TEXT,
          hour INTEGER,
          fee REAL
        )
        `,
        (err) => {
          if (err) {
            return console.error(err.message);
          }

          console.log("fees table created.");
        },
      );

      // Insert data into fees table
      const feesMap = [
        {
          feeName: "3HoursFlatRate",
          vehicleType: [0,1,2],
          hour: 3,
          fee: 40,
        },
        {
          feeName: "1HourSurchargeRateSP",
          vehicleType: [0],
          hour: 1,
          fee: 20,
        },
        {
          feeName: "1HourSurchargeRateMP",
          vehicleType: [1],
          hour: 1,
          fee: 60,
        },
        {
          feeName: "1HourSurchargeRateLP",
          vehicleType: [2],
          hour: 1,
          fee: 100,
        },
        {
          feeName: "24HoursSurchargeRate",
          vehicleType: [0,1,2],
          hour: 24,
          fee: 5000,
        },
      ];
      const feesStatement = db.prepare(`INSERT INTO fees VALUES (?, ?, ?, ?)`);

      for (let index = 0; index < feesMap.length; index++) {
        feesStatement.run(
          feesMap[index].feeName,
          feesMap[index].vehicleType,
          feesMap[index].hour,
          feesMap[index].fee,
        );
      }

      feesStatement.finalize((err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log("Data inserted into fees table.");
      });

      db.each(`SELECT * FROM fees`, (err, row) => {
        console.log(row);
      });
    });
  }

  function getDBInstance() {
    return {
      run: util.promisify(db.run),
      get: util.promisify(db.get),
      all: util.promisify(db.all),
      instance: db,
    };
  }

  return {
    initialize,
    getDBInstance,
    close() {
      db.close();
    },
  };
}

module.exports = DbLibrary;
