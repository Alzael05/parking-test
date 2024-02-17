const datetime = require("../helpers/datetime");

const SlotsModel = require("../models/SlotsModel");
const VehiclesModel = require("../models/VehiclesModel");
// const FeesModel = require("../models/FeesModel");

async function parkVehicle({ plateNumber, vehicleType, entryPoint }) {
  try {
    // Get Available Slot
    const types = {
      S: 0,
      M: 1,
      L: 2,
    };

    const type = types[vehicleType];

    const availableSlots = await SlotsModel.getAvailableSlotsByType(type);

    console.log("availableSlots", availableSlots, entryPoint);

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
      entryDateTime: datetime.getCurrentTime(),
    });

    // Update Slot Availability
    await SlotsModel.updateSlotAvailability(nearestSlotFromEntryPoint.id, 0);

    return nearestSlotFromEntryPoint;
  } catch (error) {
    console.log(error);

    return null;
  }
}

async function unparkVehicle({ plateNumber }) {
  try {
    // const feesMatrix = await FeesModel.getFees();
    const vehicleDetails = await VehiclesModel.getParkedVehicleDetails(plateNumber);
    const slotDetails = await SlotsModel.getSlotDetails(vehicleDetails.slotId);

    // Calculate parking fee
    const parkingDuration = Math.ceil(
      (Date.parse(vehicleDetails.exitDateTime) -
        Date.parse(vehicleDetails.entryDateTime)) /
        (1000 * 60 * 60),
    ); // in hours

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

    const parkingFee = calculateParkingFee(slotDetails.type, parkingDuration);

    vehicleDetails.paidFee;

    const exitDateTime = datetime.getCurrentTime();

    await VehiclesModel.updateParkedVehicleExitDateTimeAndFee(
      vehicleDetails.plateNumber,
      parkingFee,
      exitDateTime,
    );

    // Update Slot Availability
    await SlotsModel.updateSlotAvailability(vehicleDetails.slotId, 1);

    console.log(`Vehicle unparked from slot ${slot}. Parking fee: ${parkingFee} pesos`);

    return parkingFee;
  } catch (error) {
    console.log(error);

    return null;
  }
}

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
