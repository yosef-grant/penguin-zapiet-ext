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
  useCustomer,
} from "@shopify/ui-extensions-react/checkout";

import Locations from "./Locations.jsx";
import CSPortal from "./CSPortal.jsx";

import { checkoutDataReducer } from "./reducer_functions/CheckoutDataMethods.jsx";
import { Button, DatePicker } from "@shopify/ui-extensions/checkout";

import BlockLoader from "../Global/BlockLoader.jsx";
import MethodBtns from "./MethodBtns.jsx";
import DeliveryCheckStatus from "./DeliveryCheckStatus.jsx";

// import Summary from "./Summary.jsx";
// import LineItemProperties from "./LineItemProperties.jsx";
// import DeliveryInstructions from "./DeliveryInstructions.jsx";
// import RateProperties from "./RateProperties.jsx";
// import ScrollListTest from "./ScrollListTest.jsx";

// TODO adjust initialisation useEffects to only run when the target is purchase.checkout.block.render
// TODO ensure no unnecessary API calls
// ? make initial data calls outside of function and pass to both renders, rather
// ? than passing via storage

function MethodSelect({ url }) {
  // console.log("data before load: ", initRes);

  // const delGroups = useDeliveryGroups()
  // console.log('SHIPPING OPTION: ', delGroups)

  //   const url = "https://administrators-wr-steam-canvas.trycloudflare.com/";
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

  // const [nextDay, setNextDay] = useState(false);
  const [availableMethods, setAvailableMethods] = useState(null);
  const [penguinCart, setPenguinCart] = useState(null);
  const [lockerReserved, setLockerReserved] = useState(false);
  const [collectLocation, setCollectLocation] = useState(null);
  const [displayCalendar, setDisplayCalendar] = useState(false);
  const [postcode, setPostcode] = useState(null);

  const [loadMsg, setLoadMsg] = useState("Initialising...");

  // * experimental state
  const [storedAvailibility, setStoredAvailibility] = useState(null);
  const [datePickerInit, setDatePickerInit] = useState(false);
  const [checkingPostcode, setCheckingPostcode] = useState(false);

  const [noDelivery, setNoDelivery] = useState(false);
  const [showDeliveryError, setShowDeliveryError] = useState(false);

  const [cs, setCS] = useState({ status: false });

  const [initLoad, setInitLoad] = useState(true);

  const [testState, setTestState] = useState(0);

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

  // console.log("@@@@@@@@@@@@ lineitems ", JSON.stringify(lineItems));

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

  // ? run validation at cart level; attach line item props when user clicks to go to checkout

  useEffect(() => {
    const handleInitLoad = async () => {
      //console.log("INITIAL REACT LOAD - RESETTING VALUES");
      setLoadMsg("Checking available methods...");
      let res = await fetch(`${url}/pza/validate-cart-test`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(cart),
      });

      let resBody = await res.json();
      console.log("Validating Cart (using test data) ", cart, resBody);
      handleSetQLocations(resBody.locations);

      // Object.keys(resBody.methods).forEach((key, i) => {
      //   resBody.methods[key] ? `${t += ${key}$}` : null;
      // });

      // await setCartLineAttr({
      //   type: "updateCartLine",
      //   id: cart[0].id,
      //   attributes: t,
      // });

      // console.log("heres the methods: ", t);

      setAvailableMethods(resBody.methods);
      handleMethodSelect("pickup", resBody.methods);
    };

    !!initLoad && !availableMethods ? handleInitLoad() : null;
  }, []);

  const cart = lineItems.map((item) => {
    return {
      variant_id: item.merchandise.id.replace(/\D/g, ""),
      product_id: item.merchandise.product.id.replace(/\D/g, ""),
      quantity: item.quantity,
    };
  });

  let nextDayMeta = appMeta
  .filter((meta) => meta.target.type === "product")
  .map((filteredMeta) => {
    return JSON.parse(filteredMeta.metafield.value).next_day_delivery.value;
  })[0];
  
  
  
  
  let nextDay = nextDayMeta === 1 || nextDayMeta === null ? true : false;
  console.log("heres the meta: ", appMeta, `\nheres next day: `, nextDayMeta, `\nIs basket next day? `, nextDay);

  useEffect(() => {
    //console.log("++++++++++++++ cs updated: ", cs);
  }, [cs]);

  //use to intercept rogue behaviour that will screw up rates
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    return canBlockProgress &&
      attributes["Checkout-Method"] === "delivery" &&
      !!noDelivery
      ? {
          behavior: "block",
          reason: "Cannot deliver to this address",
          perform: (result) => {
            result.behavior === "block" ? setShowDeliveryError(true) : null;
          },
        }
      : {
          behavior: "allow",
          perform: () => {
            showDeliveryError ? setShowDeliveryError(false) : null;
          },
        };
  });
  // ! stop buyer progress if postcode check is ongoing

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    return canBlockProgress && !!checkingPostcode
      ? {
          behavior: "block",
          reason: "Checking postcode",
        }
      : {
          behavior: "allow",
        };
  });

  const deletePenguinReservation = async () => {
    console.log(attributes);
    if (attributes?.["Pickup-Penguin-Id"]) {
      // console.log("&&&&&&&  penguin reservation in place - should be deleted");
      try {
        await fetch(`${url}/pza/delete-locker`, {
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

  const handleMethodSelect = async (method, availabilityData) => {
    let x = Object.keys(availabilityData)
      .filter((key) => {
        return availabilityData[key];
      })
      .join();

    !!noDelivery ? setNoDelivery(false) : null;
    //console.log("handling selected method ", method);
    setLoadMsg("Setting default method...");
    if (method === "pickup") {
      let t = [
        ...lineItems[0].attributes,
        { key: "_available_methods", value: x },
        { key: "_deliveryID", value: method.charAt(0).toUpperCase() },
      ];

      await setCartLineAttr({
        type: "updateCartLine",
        id: lineItems[0].id,
        attributes: [...t],
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
    setLoadMsg("Resetting attributes...");
    await changeAttributes({
      type: "updateAttribute",
      key: "Checkout-Method",
      value: method,
    });
    Object.keys(attributes).forEach(async (key) => {
      if (
        key !== "Checkout-Method" &&
        key !== "Gift-Note" &&
        key !== "Customer-Service-Note" &&
        key !== "Lolas-CS-Member"
      ) {
        await changeAttributes({
          type: "updateAttribute",
          key: key,
          value: "",
        });
      }
    });
    await changeShippingAddress({
      type: "updateShippingAddress",
      address: {
        address1: undefined,
        address2: undefined,
        city: undefined,
        zip: undefined,
      },
    });
    initLoad ? setInitLoad(false) : null;
  };

  const customer = useCustomer();

  console.log("here is the customer: ", customer);

  useEffect(() => {
    console.log("test state has been changed. currently: ", testState);
  }, [testState]);

  // * FOR 3-page checkout ONLY
  useEffect(() => {
    const getDeliveryZones = async () => {
      try {
        setCheckingPostcode(true);
        let checkBody = {
          type: "delivery",
          postcode: currentShippingAddress.zip,
          cart: cart,
          twoDayDelivery: nextDay,
        };

        let checkRes = await fetch(`${url}/pza/check-postcode-test`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(checkBody),
        });

        let delData = await checkRes.json();

        //console.log("DATA CHECK ON POSTCODE ENTRY: ", delData);

        const newDelMethod =
          delData?.delivery?.delivery_zone === "unavailable" &&
          availableMethods?.shipping === false
            ? null
            : delData?.delivery?.delivery_zone === "unavailable" &&
              availableMethods?.shipping === true
            ? "shipping"
            : "delivery";

        if (newDelMethod) {
          console.log(
            "newDelMethod: ",
            newDelMethod,
            "current checkout method: ",
            attributes["Checkout-Method"]
          );

          let dz =
            newDelMethod === "delivery"
              ? delData.delivery.delivery_zone.replace(/[^0-9.]/g, "")
              : null;
          await setCartLineAttr({
            type: "updateCartLine",
            id: lineItems[0].id,
            attributes: [
              ...lineItems[0].attributes,
              {
                key: "_deliveryID",
                value: `${newDelMethod === "delivery" ? `D%${dz}` : `S`}`,
              },
            ],
          });
          if (
            newDelMethod === "delivery" &&
            attributes["Checkout-Method"] === "delivery"
          ) {
            setCheckingPostcode(false);
            return;
          } else {
            await changeAttributes({
              type: "updateAttribute",
              key: "Checkout-Method",
              value: newDelMethod,
            });
            Object.keys(attributes).forEach(async (key) => {
              if (
                key !== "Checkout-Method" &&
                key !== "Gift-Note" &&
                key !== "Customer-Service-Note" &&
                key !== "Lolas-CS-Member"
              ) {
                await changeAttributes({
                  type: "updateAttribute",
                  key: key,
                  value: "",
                });
              }
            });
          }

          //console.log(`RATE SHOULD BE SET TO ${newDelMethod.toUpperCase()}`);
          // * if current and previous checkout method === "delivery", don't wipe delivery attr
        } else {
          // TODO in this condition, the user should be prompted to convert to pickup or choose another address
          // console.log("RATE SHOULD BE SET TO NONE");
          // // setCheckingPostcode(false);
          setNoDelivery(true);
        }
        setCheckingPostcode(false);
      } catch (error) {
        console.error("Couldn't validate cart.");
      }
    };

    noDelivery ? setNoDelivery(false) : null;
    showDeliveryError ? setShowDeliveryError(false) : null;

    currentShippingAddress.zip &&
    availableMethods &&
    attributes["Checkout-Method"] !== "pickup"
      ? getDeliveryZones()
      : null;
  }, [currentShippingAddress.zip]);

  return (
    <>
      {initLoad ? (
        <BlockLoader message={loadMsg} />
      ) : (
        <>
          <MethodBtns
            checkoutMethod={attributes["Checkout-Method"]}
            handleMethodSelect={handleMethodSelect}
            availableMethods={availableMethods}
          />
          {attributes["Checkout-Method"] === "pickup" &&
          checkoutData?.pickup ? (
            <>
              {!!cs.status && (
                <CSPortal
                  setCS={setCS}
                  cs={cs}
                  allLocations={checkoutData.pickup.qCollectLocations}
                />
              )}
              <Locations
                checkoutData={checkoutData}
                selectLocation={handleSelectPickupLocation}
                removeLocation={handleRemoveSelectedLocation}
                url={url}
                cart={lineItems}
                nextDay={nextDay}
                setProximityLocations={handleSetCollectLocations}
                setCS={setCS}
                localStorage={localStorage}
                currentShippingAddress={currentShippingAddress}
                attributes={attributes}
              />
            </>
          ) : attributes["Checkout-Method"] !== "pickup" ? (
            <DeliveryCheckStatus
              showDeliveryError={showDeliveryError}
              noDelivery={noDelivery}
              availableMethods={availableMethods}
              checkingPostcode={checkingPostcode}
            />
          ) : null}
        </>
      )}
    </>
  );
}

export default MethodSelect;
