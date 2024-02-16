const moment = require("moment");

// Function to get current time in local timezone
function getCurrentTime() {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
}

// Function to subtract two times
function subtractTimes(time1, time2) {
  const diff = moment(time1, "YYYY-MM-DD HH:mm:ss.SSS").diff(
    moment(time2, "YYYY-MM-DD HH:mm:ss.SSS"),
  );

  return moment.utc(diff).format("HH:mm:ss.SSS");
}

module.exports = {
  getCurrentTime,
  subtractTimes,
};
