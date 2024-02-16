const datetime = require("../helpers/datetime");

const SlotsModel = require("../models/SlotsModel");
const VehiclesModel = require("../models/VehiclesModel");

function SlotsController() {
  function index() {}

  async function parkVehicle({ plateNumber, vehicleType, entryPoint }) {
    try {
      // Get Available Slot
      const vehicleSizes = {
        S: 0,
        M: 1,
        L: 2,
      };

      const vehicleSize = vehicleSizes[vehicleType];

      const availableSlots = await SlotsModel.getAvailableSlotsBySize(vehicleSize);

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
      VehiclesModel.insertParkedVehicle({
        plateNumber,
        slotId: nearestSlotFromEntryPoint.id,
        size: vehicleSize,
        entryDate: datetime.getCurrentTime(),
      });

      // Update Slot Availability
      SlotsModel.updateSlotAvailability(nearestSlotFromEntryPoint.id, 0);
    } catch (error) {
      console.log(error);
    }
  }

  function unparkVehicle({ plateNumber, vehicleType, entryPoint}) {
    if (this.occupiedSlots[slot]) {
      const { vehicleType, entryTime } = this.occupiedSlots[slot];
      const exitTime = Date.now();
      const parkingDuration = Math.ceil((exitTime - entryTime) / (1000 * 60 * 60)); // in hours

      const parkingFee = this.calculateParkingFee(vehicleType, parkingDuration);
      delete this.occupiedSlots[slot];

      console.log(`Vehicle unparked from slot ${slot}. Parking fee: ${parkingFee} pesos`);
      return parkingFee;
    } else {
      console.log(`Slot ${slot} is not occupied.`);
      return 0;
    }
  }

  return {
    parkVehicle,
  };
}

module.exports = SlotsController;
