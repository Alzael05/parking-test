const datetime = require("../helpers/datetime");

const SlotsModel = require("../models/SlotsModel");
const VehiclesModel = require("../models/VehiclesModel");
// const FeesModel = require("../models/FeesModel");

async function parkVehicle({ plateNumber, vehicleType, entryPoint }) {
  try {
    let currentDateTime = datetime.getCurrentTime();

    // Validate Vehicle Plate
    const vehicleDetails = await VehiclesModel.getParkedVehicleDetails(plateNumber);

    // Existing record return error already been parked
    if (vehicleDetails.length > 0) {
      if (vehicleDetails[0].exitDateTime === null) {
        throw new Error(`Vehicle with plate number ${plateNumber} is already parked.`);
      }

      /**
       * (c) A vehicle leaving the parking complex and returning within one hour must be charged continuous rate,
       * i.e. the vehicle must be considered as if it did not leave. Otherwise, rates must be implemented as described.
       */
      // Continue parking if less than 1 hour
      const leftParkingDuration = Math.ceil(
        (Date.parse(currentDateTime) - Date.parse(vehicleDetails[0].exitDateTime)) /
          (1000 * 60 * 60),
      ); // in hours

      if (leftParkingDuration <= 1) {
        currentDateTime = vehicleDetails[0].entryDateTime;
      }

      console.log(`parkingDuration - ${leftParkingDuration}hrs`);
    }

    // Get Available Slot
    /**
     * 2. There are three types of vehicles: small (S), medium (M) and large (L),
     *  and there are three types or parking slots: small (SP), medium (MP) and large (LP).
     *  (a) S vehicles can park in SP, MP and LP parking spaces;
     *  (b) M vehicles can park in MP and LP parking spaces; and
     *  (c) L vehicles can park only in LP parking spaces.
     */
    const types = {
      S: 0,
      M: 1,
      L: 2,
    };

    const type = types[vehicleType];

    const availableSlots = await SlotsModel.getAvailableSlotsByType(type);

    console.log("entryPoint", entryPoint);
    console.log("availableSlots", availableSlots);

    let slotFromEntryPoint = {};

    for (let index = 0; index < availableSlots.length; index++) {
      const slot = availableSlots[index];

      const distanceFromEntryPoint = JSON.parse(slot.distanceFromEntryPoint);

      slotFromEntryPoint[slot.id] = distanceFromEntryPoint[entryPoint];
    }

    let sortedSlotsFromEntryPoint = Object.entries(slotFromEntryPoint)
      .sort((a, b) => a[1] - b[1])
      .reduce((slots, [slotId, distancePoint], index) => {
        slots[index] = {
          id: slotId,
          distancePoint,
        };

        return slots;
      }, {});

    const nearestSlotFromEntryPoint = sortedSlotsFromEntryPoint[0];

    // Start Assigning Slot
    await VehiclesModel.insertParkedVehicle({
      plateNumber,
      slotId: nearestSlotFromEntryPoint.id,
      type,
      entryDateTime: currentDateTime,
    });

    // Update Slot Availability
    await SlotsModel.updateSlotAvailability(nearestSlotFromEntryPoint.id, 0);

    console.log(
      `Vehicle ( ${plateNumber} ) is assigned to slot ${nearestSlotFromEntryPoint.id}. Entry date and time: ${currentDateTime}`,
    );

    return `Vehicle ( ${plateNumber} ) is assigned to slot ${nearestSlotFromEntryPoint.id}. Entry date and time: ${currentDateTime}`;
  } catch (error) {
    console.log(error);

    return error;
  }
}

async function unparkVehicle({ plateNumber }) {
  try {
    // const feesMatrix = await FeesModel.getFees();
    const vehicleDetails = await VehiclesModel.getParkedVehicleDetails(plateNumber);
    const slotDetails = await SlotsModel.getSlotDetails(vehicleDetails[0].slotId);

    const exitDateTime = datetime.getCurrentTime();

    // Calculate parking fee
    const parkingDuration = Math.ceil(
      (Date.parse(exitDateTime) - Date.parse(vehicleDetails[0].entryDateTime)) /
        (1000 * 60 * 60),
    ); // in hours

    console.log(`parkingDuration - ${parkingDuration}hrs`);

    /* for (let index = 0; index < feesMatrix.length; index++) {
      const feeDetails = feesMatrix[index];

      if (JSON.parse(feeDetails.slotType).includes(slotDetails.type)) {
        if (!feeDetails.isConditional) {
          totalPay += feeDetails.fee;

          continue;
        }

        feeDetails.hour;
      }
    } */

    const parkingFee = calculateParkingFee(slotDetails[0].type, parkingDuration);

    await VehiclesModel.updateParkedVehicleExitDateTimeAndFee(
      vehicleDetails[0].plateNumber,
      parkingFee,
      exitDateTime,
    );

    // Update Slot Availability
    await SlotsModel.updateSlotAvailability(vehicleDetails[0].slotId, 1);

    console.log(
      `Vehicle ( ${vehicleDetails[0].plateNumber} ) from slot ${slotDetails[0].id} left the parking complex. Parking fee: ${parkingFee} pesos. Exit date and time: ${exitDateTime}`,
    );

    return `Vehicle ( ${vehicleDetails[0].plateNumber} ) from slot ${slotDetails[0].id} left the parking complex. Parking fee: ${parkingFee} pesos. Exit date and time: ${exitDateTime}`;
  } catch (error) {
    console.log(error);

    return error;
  }
}

/**
 * (a) All types of car pay the flat rate of 40 pesos for the first three (3) hours;
 * (b) The exceeding hourly rate beyond the initial three (3) hours will be charged as follows:
 *  - 20/hour for vehicles parked in SP;
 *  - 60/hour for vehicles parked in MP; and
 *  - 100/hour for vehicles parked in LP
 *
 *  Take note that exceeding hours are charged depending on parking slot size regardless of vehicle size.
 *
 *  For parking that exceeds 24 hours, every full 24 hour chunk is charged 5,000 pesos regardless of parking slot.
 *  The remainder hours are charged using the method explained in (b).
 *
 *  Parking fees are calculated using rounding up method, e.g. 6.5 hours must be rounded to 7.
 */
function calculateParkingFee(vehicleType, duration) {
  const baseRate = 40;
  let hourlyRate;

  switch (vehicleType) {
    case 0: // 'S':
      hourlyRate = 20;
      break;
    case 1: // 'M':
      hourlyRate = 60;
      break;
    case 2: // 'L':
      hourlyRate = 100;
      break;
    default:
      hourlyRate = 0;
      break;
  }

  const exceedHours = Math.max(duration - 3, 0);
  const hourlyFee = exceedHours * hourlyRate;

  if (duration > 24) {
    const fullDays = Math.floor(duration / 24);
    const fullDayFee = fullDays * 5000;
    return fullDayFee + hourlyFee;
  }

  return baseRate + hourlyFee;
}

module.exports = {
  parkVehicle,
  unparkVehicle,
};
