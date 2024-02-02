import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";

import {
  Text,
  reactExtension,
  useApplyShippingAddressChange,
  useCartLines,
  useAttributes,
  useBuyerJourneyIntercept,
  useApi,
  useApplyAttributeChange,
  Pressable,
  InlineLayout,
  useApplyCartLinesChange,
  Heading,
  useShippingAddress,
  useAppMetafields,
  View,
  useStorage,
  Divider,
  useShippingOptionTarget,
  useDeliveryGroups,
  useApplyNoteChange,
  useNote,
} from "@shopify/ui-extensions-react/checkout";

import Locations from "./Locations.jsx";
import DateSelect from "./DateSelect.jsx";
import CSPortal from "./CSPortal.jsx";

import { checkoutDataReducer } from "./reducer_functions/CheckoutDataMethods.jsx";
import { Button, DatePicker } from "@shopify/ui-extensions/checkout";

import BlockLoader from "./BlockLoader.jsx";
import MethodSelect from "./MethodSelect.jsx";

import Summary from "./Summary.jsx";
import LineItemProperties from "./LineItemProperties.jsx";
import DeliveryInstructions from "./DeliveryInstructions.jsx";

// ! Rendering in two places simultaneously causing react to render unecessarily - could be disrupting app functionality
// TODO adjust initialisation useEffects to only run when the target is purchase.checkout.block.render

// ? make initial data calls outside of function and pass to both renders, rather
// ? than passing via storage

const MethodSelectRender = reactExtension(
  "purchase.checkout.block.render",
  () => <Extension />
);

const DatePickerRender = reactExtension(
  "purchase.checkout.shipping-option-list.render-before",
  () => <Extension />
);

const SummaryRender = reactExtension(
  "purchase.checkout.cart-line-list.render-after",
  () => <SummaryExtension />
);

const DeliveryInstructionsRender = reactExtension(
  "purchase.checkout.delivery-address.render-after",
  () => <DeliveryInstructionsExtension />
);

const LineItemPropsRender = reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <LineItemPropsExtension />
);

function LineItemPropsExtension() {
  return <LineItemProperties />;
}
function SummaryExtension() {
  return <Summary />;
}

function DeliveryInstructionsExtension() {
  return <DeliveryInstructions />;
}

export {
  MethodSelectRender,
  DatePickerRender,
  SummaryRender,
  LineItemPropsRender,
  DeliveryInstructionsRender,
};

//export { QuickCollectRender };
function Extension() {
  // console.log("data before load: ", initRes);

  // const delGroups = useDeliveryGroups()
  // console.log('SHIPPING OPTION: ', delGroups)

  const app_url = "https://ac3b-212-140-232-13.ngrok-free.app";
  const [checkoutData, dispatch] = useReducer(checkoutDataReducer, {});

  const handleSetQLocations = (locations) => {
    dispatch({
      type: "acquired_q_locations",
      all_locations: locations,
    });
  };

  const handleSetCollectLocations = (data) => {
    dispatch({
      type: "acquired_general_delivery_info",
      data: data,
    });
  };

  const handleRemoveSelectedLocation = () => {
    dispatch({
      type: "selected_pickup_location_removed",
    });
  };

  const handleSelectPickupLocation = (hours, description, location) => {
    dispatch({
      type: "selected_pickup_location_added",
      hours: hours,
      description: description,
      location: location,
    });
  };

  const handleConfirmPickupLocation = (dates) => {
    dispatch({
      type: "selected_pickup_location_confirmed",
      location_dates: dates,
    });
  };

  const handleSelectDates = (date, weekday) => {
    dispatch({
      type: "selected_dates",
      date: date,
      weekday: weekday,
    });
  };

  const handleMSReset = () => {
    dispatch({
      type: "reset_MS_Checkout",
    });
  };

  const [qCollectLocation, setQCollectLocation] = useState(null);
  const [minDate, setMinDate] = useState(null);
  // const [nextDay, setNextDay] = useState(false);
  const [availableMethods, setAvailableMethods] = useState(null);
  const [penguinCart, setPenguinCart] = useState(null);
  const [lockerReserved, setLockerReserved] = useState(false);
  const [collectLocation, setCollectLocation] = useState(null);
  const [displayCalendar, setDisplayCalendar] = useState(false);
  const [postcode, setPostcode] = useState(null);

  // * experimental state
  const [storedAvailibility, setStoredAvailibility] = useState(null);
  const [datePickerInit, setDatePickerInit] = useState(false);

  const [cs, setCS] = useState({ status: false });

  const [initLoad, setInitLoad] = useState(true);

  const [testnum, setTestnum] = useState(1);

  const lineItems = useCartLines();

  let setCartLineAttr = useApplyCartLinesChange();
  const appMeta = useAppMetafields();

  const localStorage = useStorage();
  let CollectBtn = useRef();

  // useEffect(() => {
  //   console.log(":><: THIS IS THE CURRENT PENGUIN CART: ", penguinCart);
  // }, [penguinCart]);

  let changeAttributes = useApplyAttributeChange();

  const { extension } = useApi();
  const changeShippingAddress = useApplyShippingAddressChange();
  const currentShippingAddress = useShippingAddress();
  const changeNote = useApplyNoteChange();
  const cartNote = useNote();

  // console.log("@@@@@@@@@@@@ capabilities ", extension, extension.target);

  const attr = useAttributes();

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  // * Uncomment to track CART attributes:
  // console.log(
  //   'attributes from parent: ',
  //   attributes,
  //   '\navailable methods from parent: ',
  //   availableMethods,
  //   '\nisFirstTimeLoad? ',
  //   initLoad
  // );

  // TODO delete penguin order if reservation confirmed and user hits X button
  // TODO hide reservation banner

  useEffect(() => {
    const handleInitLoad = async () => {
      console.log("INITIAL REACT LOAD - RESETTING VALUES");
      await localStorage.delete("selected_location_info");
      await localStorage.delete("availability");
      let res = await fetch(`${app_url}/pza/validate-cart-test`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(cart),
      });
      await localStorage.delete("selected_location_info");
      // Object.keys(attributes).forEach(async (key) => {
      //   await changeAttributes({
      //     type: "updateAttribute",
      //     key: key,
      //     value: "",
      //   });
      // });

      let resBody = await res.json();
      console.log("Validating Cart (using test data) ", cart, resBody);
      await localStorage.write("availability", resBody);
      handleSetQLocations(resBody.locations);
      setAvailableMethods(resBody.methods);

      handleMethodSelect("pickup");
      setInitLoad(false);
    };
    !!initLoad && extension.target === "purchase.checkout.block.render"
      ? handleInitLoad()
      : null;
  }, []);

  // useEffect(() => {
  //   console.log("local storage has been updated!");

  //   const checkStorage = async() => {
  //     let t = await localStorage.read('selected_location_info');

  //     console.log('checking storage... date picker initialised? ', datePickerInit, 'storage contents: ', t)
  //     if (t) {
  //       console.log('location data is still present: ', t);
  //       setDatePickerInit(true)
  //     }
  //     else {
  //       console.log('location data removed!')
  //       datePickerInit ? setDatePickerInit(false) : null;
  //     }
  //   }

  //   checkStorage();
  // }, [localStorage]);

  useEffect(() => {
    if (currentShippingAddress.zip) {
      !datePickerInit ? setDatePickerInit(true) : null;
    } else if (!currentShippingAddress.zip) {
      datePickerInit ? setDatePickerInit(false) : null;
    }
  }, [currentShippingAddress.zip]);

  // initial validation

  //console.table(attributes);

  const cart = lineItems.map((item) => {
    return {
      variant_id: item.merchandise.id.replace(/\D/g, ""),
      product_id: item.merchandise.product.id.replace(/\D/g, ""),
      quantity: item.quantity,
    };
  });

  let nextDayMeta = appMeta.map((meta) => {
    return JSON.parse(meta.metafield.value).next_day_delivery.value;
  });
  let nextDay =
    nextDayMeta.includes(1) || nextDayMeta.includes(null) ? true : false;

  useEffect(() => {
    console.log("++++++++++++++ cs updated: ", cs);
  }, [cs]);

  // use to intercept rogue behaviour that will screw up rates
  // useBuyerJourneyIntercept(({ canBlockProgress }) => {
  //   return canBlockProgress && attributes['Checkout-Method']
  //     ? {
  //         behavior: 'block',
  //         reason: 'Invalid shipping country',
  //         errors: [
  //           {
  //             // An error without a `target` property is shown at page level
  //             message: 'Sorry, we can only ship to Canada',
  //           },
  //         ],
  //       }
  //     : {
  //         behavior: 'allow',
  //       };
  // });

  const deletePenguinReservation = async () => {
    console.log(attributes);
    if (attributes?.["Pickup-Penguin-Id"]) {
      console.log("&&&&&&&  penguin reservation in place - should be deleted");
      try {
        await fetch(`${app_url}/pza/delete-locker`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ locker_id: attributes["Pickup-Penguin-Id"] }),
        });
      } catch (error) {
        console.error(
          `Failed to delete locker order ${attributes["Pickup-Penguin-Id"]}`
        );
      }
    } else return;
  };

  const handleMethodSelect = async (method) => {
    console.log("handling selected method ", method);
    await changeShippingAddress({
      type: "updateShippingAddress",
      address: {
        address1: undefined,
        city: undefined,
        zip: undefined,
      },
    });

    if (method === "pickup") {
      await setCartLineAttr({
        type: "updateCartLine",
        id: lineItems[0].id,
        attributes: [
          ...lineItems[0].attributes,
          {
            key: "_deliveryID",
            value: method.charAt(0).toUpperCase(),
          },
        ],
      });
      if (cartNote) {
        await changeNote({
          type: "removeNote",
        });
      }
    } else {
      await setCartLineAttr({
        type: "updateCartLine",
        id: lineItems[0].id,
        attributes: [
          ...lineItems[0].attributes,
          {
            key: "_deliveryID",
            value: method.charAt(0).toUpperCase(),
          },
        ],
      });
      handleRemoveSelectedLocation();
    }

    await changeAttributes({
      type: "updateAttribute",
      key: "Checkout-Method",
      value: method,
    });
    Object.keys(attributes).forEach(async (key) => {
      if (key !== "Checkout-Method") {
        await changeAttributes({
          type: "updateAttribute",
          key: key,
          value: "",
        });
      }
    });
  };

  return (
    <>
      {extension.target === "purchase.checkout.block.render" ? (
        <>
          {initLoad ? (
            <BlockLoader message={"Loading..."} />
          ) : (
            <MethodSelect
              attributes={attributes}
              checkoutData={checkoutData}
              setCS={setCS}
              cs={cs}
              url={app_url}
              lineItems={lineItems}
              nextDay={nextDay}
              handleSelectPickupLocation={handleSelectPickupLocation}
              handleRemoveSelectedLocation={handleRemoveSelectedLocation}
              handleSetCollectLocations={handleSetCollectLocations}
              handleMethodSelect={handleMethodSelect}
              localStorage={localStorage}
            />
          )}
        </>
      ) : extension.target ===
          "purchase.checkout.shipping-option-list.render-before" &&
        datePickerInit ? (
        <>
          <DateSelect
            attributes={attributes}
            currentShippingAddress={currentShippingAddress}
            checkoutData={checkoutData}
            cart={lineItems}
            appMeta={appMeta}
            url={app_url}
            changeAttributes={changeAttributes}
            setCartLineAttr={setCartLineAttr}
            availableMethods={availableMethods}
            setAvailableMethods={setAvailableMethods}
            handleMethodSelect={handleMethodSelect}
            localStorage={localStorage}
          />
        </>
      ) : null}
    </>
  );
}
