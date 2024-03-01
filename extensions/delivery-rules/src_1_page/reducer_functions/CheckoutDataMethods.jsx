const checkoutDataReducer = (checkoutData, action) => {
  let x = checkoutData;
  switch (action.type) {
    case "acquired_q_locations": {
      x.pickup = { qCollectLocations: action.all_locations };
      return JSON.parse(JSON.stringify(x));
    }
    case "acquired_general_delivery_info": {
      x.pickup = {
        qCollectLocations: x?.pickup?.qCollectLocations
          ? x.pickup.qCollectLocations
          : null,
        proximityCollectLocations: action.data.pickup_locations,
      };
      return JSON.parse(JSON.stringify(x));
    }
    case "selected_pickup_location_added": {
      x?.delivery ? null : (x.qCollect = true);
      x.pickup = {
        ...x.pickup,
        selectedLocation: {
          location_hours: action.hours,
          location_description: action.description,
          info: action.location,
        },
      };
      return JSON.parse(JSON.stringify(x));
    }
    case "selected_pickup_location_confirmed": {
      x.pickup = {
        ...x.pickup,
        selectedLocation: {
          ...x.pickup.selectedLocation,
          dates: action.location_dates,
        },
      };
      return JSON.parse(JSON.stringify(x));
    }
    case "selected_pickup_location_removed": {
      x.pickup.selectedLocation = null;
      return JSON.parse(JSON.stringify(x));
    }
    case "selected_dates": {
      return {
        ...x,
        checkout_date: { date: action.date, day: action.weekday },
      };
    }
    case "reset_MS_Checkout": {
        x.delivery = null;
        x.pickup.selectedLocation = null;
        x.qCollect = null;
        return JSON.parse(JSON.stringify(x));
    }
    default: {
      console.log("ERROR handling reducer function for ", action.type);
    }
  }
};

export { checkoutDataReducer };
