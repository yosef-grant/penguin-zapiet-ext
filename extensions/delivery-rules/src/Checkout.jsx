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
} from "@shopify/ui-extensions-react/checkout";

import QuickCollect from "./QuickCollect.jsx";
import CheckoutMethodSelect from "./CheckoutMethodSelect.jsx";

import Locations from "./Locations.jsx";
import DateSelect from "./DateSelect.jsx";

import { checkoutDataReducer } from "./reducer_functions/CheckoutDataMethods.jsx";
import { Button, DatePicker } from "@shopify/ui-extensions/checkout";
import LocationsSelect from "./LocationsSelect.jsx";

// const QuickCollectRender = reactExtension(
//   'purchase.checkout.block.render',
//   () => <TestQC />
// );

// const MethodSelectRender = reactExtension(
//   'purchase.checkout.delivery-address.render-before',
//   () => <TestMS />
// );

const QuickCollectRender = reactExtension(
  "purchase.checkout.block.render",
  () => <Extension />
);

const MethodSelectRender = reactExtension(
  "purchase.checkout.shipping-option-list.render-before",
  () => <Extension />
);

export { QuickCollectRender, MethodSelectRender };

function Extension() {
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
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cs, setCS] = useState({ status: false });

  const [globalLoad, setGlobalLoad] = useState(true);
  const [testnum, setTestnum] = useState(1);

  const lineItems = useCartLines();

  let setCartLineAttr = useApplyCartLinesChange();
  const appMeta = useAppMetafields();

  let CollectBtn = useRef();

  useEffect(() => {
    console.log(":><: THIS IS THE CURRENT PENGUIN CART: ", penguinCart);
  }, [penguinCart]);

  const app_url = "https://bf4c-81-103-75-43.ngrok-free.app";

  let changeAttributes = useApplyAttributeChange();

  const { extension } = useApi();

  // console.log("@@@@@@@@@@@@ capabilities ", extension, extension.target);

  const attr = useAttributes();

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  console.log("attributes from parent: ", attributes);
  // * Uncomment to track CART attributes:
  // console.log(attributes);

  // TODO delete penguin order if reservation confirmed and user hits X button
  // TODO hide reservation banner

  useEffect(() => {
    console.log("UPDATED SELECTED METHOD: ", selectedMethod);
  }, [selectedMethod]);

  useEffect(() => {
    // const t =  () => {
    //   t();
    // }
    // TODO remove penguin attribute values on first APP render
    Object.keys(attributes).forEach(async (key) => {
      await changeAttributes({
        type: "updateAttribute",
        key: key,
        value: "",
      });
    });
  }, []);

  // initial validation
  useEffect(() => {
    console.log("quick collect rendered: ", lineItems);

    const validateCart = async () => {
      let res = await fetch(`${app_url}/pza/validate-cart-test`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(cart),
      });

      let resBody = await res.json();
      console.log(
        "TEST CART (Won't be matched on test server!): ",
        cart,
        resBody
      );
      setAvailableMethods(resBody.methods);
      handleSetQLocations(resBody.locations);
      setGlobalLoad(false);
    };
    checkoutData.pickup?.qCollectLocations.length ? null : validateCart();
  }, []);

  //console.table(attributes);

  const cart = lineItems.map((item) => {
    return {
      variant_id: item.merchandise.id.replace(/\D/g, ""),
      product_id: item.merchandise.product.id.replace(/\D/g, ""),
      quantity: item.quantity,
    };
  });
  const changeShippingAddress = useApplyShippingAddressChange();
  const currentShippingAddress = useShippingAddress();

  let nextDayMeta = appMeta.map((meta) => {
    return JSON.parse(meta.metafield.value).next_day_delivery.value;
  });
  let nextDay =
    nextDayMeta.includes(1) || nextDayMeta.includes(null) ? true : false;

  // useEffect(() => {
  //   const stripAddress = async () => {
  //     await changeShippingAddress({
  //       type: "updateShippingAddress",
  //       address: {
  //         address1: "",
  //         city: "",
  //         zip: "",
  //       },
  //     });
  //   };
  //   stripAddress();
  // }, [selectedMethod]);

  useEffect(() => {
    console.log("##################checkout data ", checkoutData);
  }, [checkoutData]);

  useEffect(() => {
    console.log("++++++++++++++ cs updated: ", cs);
  }, [cs]);

  // use to intercept rogue behaviour that will screw up rates
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    return canBlockProgress && attributes["Checkout-Method"]
      ? {
          behavior: "block",
          reason: "Invalid shipping country",
          errors: [
            {
              // An error without a `target` property is shown at page level
              message: "Sorry, we can only ship to Canada",
            },
          ],
        }
      : {
          behavior: "allow",
        };
  });

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

  useEffect(() => {
    handleMethodSelect("pickup");
  }, []);

  const handleMethodSelect = async (method) => {
    await changeAttributes({
      type: "updateAttribute",
      key: "Checkout-Method",
      value: method,
    });
    if (selectedMethod !== method) {
      await changeShippingAddress({
        type: "updateShippingAddress",
        address: {
          address1: "",
          city: "",
          zip: "",
        },
      });
    }
    setSelectedMethod(method);
    if (method === "pickup") {
      await setCartLineAttr({
        type: "updateCartLine",
        id: lineItems[0].id,
        attributes: [
          {
            key: "_deliveryID",
            value: method.charAt(0).toUpperCase(),
          },
        ],
      });
    } else {
      await setCartLineAttr({
        type: "updateCartLine",
        id: lineItems[0].id,
        attributes: [
          {
            key: "_deliveryID",
            value: method.charAt(0).toUpperCase(),
          },
        ],
      });
    }
  };

  useEffect(() => {
    console.log("shipping addresss updated! ", currentShippingAddress.zip),
      console.log("\n cart lines: ", lineItems);
  }, [currentShippingAddress]);

  return (
    <>
      {extension.target === "purchase.checkout.block.render" ? (
        <>
            {/* <Button >Base</Button>
            <Button >Accent</Button>
            <Button >Decorative</Button>
            <Button >interactive</Button>
            <Button >subdued</Button>
            <Button >info</Button>
            <Button >success</Button>
            <Button >warning</Button>
            <Button >critical</Button>
            <Button >monochrome</Button> */}
          <InlineLayout spacing={"tight"}>
            <Pressable
              // disabled={checkoutData?.methods?.pickup === false ? true : false}
              inlineAlignment={"center"}
              blockAlignment={"center"}
              cornerRadius={"base"}
              minBlockSize={50}
              border={"base"}
              background={
                selectedMethod === "pickup" ? "subdued" : "transparent"
              }
              onPress={() => handleMethodSelect("pickup")}
   
            >
              <Text size="medium"
              emphasis="bold"
              >
              Collection
              </Text>

            </Pressable>
            <Pressable
              // disabled={checkoutData?.methods?.delivery === false ? true : false}
              inlineAlignment={"center"}
              blockAlignment={"center"}
              cornerRadius={"base"}
              minBlockSize={50}
              border={"base"}
              background={
                selectedMethod && selectedMethod !== "pickup"
                  ? "subdued"
                  : "transparent"
              }
              onPress={() => handleMethodSelect("delivery")}
            >
              <Text size="medium"
              emphasis="bold"
              >
              Delivery
              </Text>
            </Pressable>
          </InlineLayout>
          {selectedMethod === "pickup" && checkoutData?.pickup ? (
            <>
              <Locations
                checkoutData={checkoutData}
                selectLocation={handleSelectPickupLocation}
                removeLocation={handleRemoveSelectedLocation}
                url={app_url}
                cart={lineItems}
                nextDay={nextDay}
                setProximityLocations={handleSetCollectLocations}
              />
            </>
          ) : (
            "Please enter your address below to see delivery options."
          )}
        </>
      ) : extension.target ===
        "purchase.checkout.shipping-option-list.render-before" ? (
        <>
          {((attributes["Checkout-Method"] === "pickup" &&
            attributes?.["Pickup-Location-Id"] &&
            attributes?.["Pickup-Location-Type"]) ||
            (attributes["Checkout-Method"] === "delivery" &&
              currentShippingAddress.zip)) && (
            <DateSelect
              attributes={attributes}
              currentShippingAddress={currentShippingAddress}
              checkoutData={checkoutData}
              cart={lineItems}
              appMeta={appMeta}
              url={app_url}
              setCartLineAttr={setCartLineAttr}
            />
          )}
        </>
      ) : null}
    </>
  );
}

<script>let</script>;
