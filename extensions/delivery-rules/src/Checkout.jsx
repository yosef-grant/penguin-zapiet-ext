import React, { useEffect, useState, useLayoutEffect } from "react";

import {
  reactExtension,
  useApplyShippingAddressChange,
  useCartLines,
  useShippingAddress,
  useAttributeValues,
  useAttributes,
  useBuyerJourneyIntercept,
  useApi,
  useApplyAttributeChange,
} from "@shopify/ui-extensions-react/checkout";

import QuickCollect from "./QuickCollect.jsx";
import Calendar from "./Calendar.jsx";
import CheckoutMethodSelect from "./CheckoutMethodSelect.jsx";
import {
  Heading,
  Icon,
  Pressable,
  View,
} from "@shopify/ui-extensions/checkout";
import PickupInfoCard from "./PickupInfoCard.jsx";
import CSPortal from "./CSPortal.jsx";

import TestMS from "./tst/TestMS.jsx";
import TestQC from "./tst/TestQC.jsx";

let b = "testing";

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
  "purchase.checkout.delivery-address.render-before",
  () => <Extension />
);

export { QuickCollectRender, MethodSelectRender };

function Extension() {
  const [qCollectLocation, setQCollectLocation] = useState(null);
  const [checkoutData, setCheckoutData] = useState({});
  const [minDate, setMinDate] = useState(null);
  const [nextDay, setNextDay] = useState(false);
  const [availableMethods, setAvailableMethods] = useState(null);
  const [penguinCart, setPenguinCart] = useState(null);
  const [lockerReserved, setLockerReserved] = useState(false);
  const [collectLocation, setCollectLocation] = useState(null);
  const [displayCalendar, setDisplayCalendar] = useState(false);
  const [postcode, setPostcode] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cs, setCS] = useState({ status: false });
  const [allLocations, setAllLocations] = useState(null);

  const [globalLoad, setGlobalLoad] = useState(true);
  const [testnum, setTestnum] = useState(1);

  const lineItems = useCartLines();

  useEffect(() => {
    console.log(":><: THIS IS THE CURRENT PENGUIN CART: ", penguinCart);
  }, [penguinCart]);

  const app_url = "https://f6fd-212-140-232-13.ngrok-free.app";

  const test = useAttributeValues([
    "Checkout-Method",
    "Pickup-Location-Company",
    "Pickup-Location-Type",
    "Pickup-Date",
    "Pickup-AM-Hours",
    "Pickup-PM-Hours",
    "Pickup-Location-Id",
  ]);

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

  useEffect(() => {
    // const t =  () => {
    //   t();
    // }

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
      let x = checkoutData;
      x.pickup = { qCollectLocations: resBody.locations };

      setCheckoutData(JSON.parse(JSON.stringify(x)));
      setGlobalLoad(false);
    };
    checkoutData.pickup?.qCollectLocations.length ? null : validateCart();
  }, []);

  console.table(attributes);

  const cart = lineItems.map((item) => {
    return {
      variant_id: item.merchandise.id.replace(/\D/g, ""),
      product_id: item.merchandise.product.id.replace(/\D/g, ""),
      quantity: item.quantity,
    };
  });
  const changeShippingAddress = useApplyShippingAddressChange();

  const shippingAddress = useShippingAddress();

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

  return (
    <>
      {extension.target === "purchase.checkout.block.render" ? (
        <>
          <Heading level={1}>Quick Collect</Heading>
          {checkoutData.pickup?.selectedLocation &&
            checkoutData?.pickup?.selectedLocation?.dates && (
              <>
                <View
                  position={{
                    type: "absolute",
                    blockStart: `${0}%`,
                    inlineEnd: 0,
                  }}
                >
                  <Pressable
                    onPress={() => handleReset()}
                    border={"base"}
                    cornerRadius={"fullyRounded"}
                    backgroud={"subdued"}
                    padding={"extraTight"}
                    inlineAlignment={"center"}
                    blockAlignment={"center"}
                  >
                    <Icon source="close" appearance={"critical"} />
                  </Pressable>
                </View>
              </>
            )}
          <QuickCollect
            lineItems={lineItems}
            changeShippingAddress={changeShippingAddress}
            setQCollectLocation={setQCollectLocation}
            qCollectLocation={qCollectLocation}
            cart={cart}
            setCheckoutData={setCheckoutData}
            checkoutData={checkoutData}
            setMinDate={setMinDate}
            nextDay={nextDay}
            url={app_url}
            setNextDay={setNextDay}
            penguinCart={penguinCart}
            setPenguinCart={setPenguinCart}
            setAvailableMethods={setAvailableMethods}
            setSelectedMethod={setSelectedMethod}
            setDisplayCalendar={setDisplayCalendar}
            globalLoad={globalLoad}
            setGlobalLoad={setGlobalLoad}
          />
        </>
      ) : extension.target ===
        "purchase.checkout.delivery-address.render-before" ? (
        <>
          <CheckoutMethodSelect
            availableMethods={availableMethods}
            postcode={postcode}
            setPostcode={setPostcode}
            cart={cart}
            nextDay={nextDay}
            url={app_url}
            setAddress={changeShippingAddress}
            setSelectedMethod={setSelectedMethod}
            selectedMethod={selectedMethod}
            setCheckoutData={setCheckoutData}
            setMinDate={setMinDate}
            setPenguinCart={setPenguinCart}
            setCollectLocation={setCollectLocation}
            collectLocation={collectLocation}
            setCS={setCS}
            allLocations={allLocations}
            setDisplayCalendar={setDisplayCalendar}
            checkoutData={checkoutData}
            globalLoad={globalLoad}
            setGlobalLoad={setGlobalLoad}
            setTestnum={setTestnum}
          />
        </>
      ) : null}
      {!!cs.status && (
        <CSPortal setCS={setCS} cs={cs} allLocations={allLocations} />
      )}
      {!!displayCalendar && minDate && selectedMethod && (
        <>
          <Calendar
            minDate={minDate}
            setCheckoutData={setCheckoutData}
            checkoutData={checkoutData}
            penguinCart={penguinCart}
            lockerReserved={lockerReserved}
            setLockerReserved={setLockerReserved}
            url={app_url}
            selectedMethod={selectedMethod}
          />
          {!!checkoutData?.pickup?.selectedLocation &&
            !!checkoutData?.checkout_date && (
              <PickupInfoCard
                location={checkoutData.pickup.selectedLocation}
                checkoutData={checkoutData}
              />
            )}
        </>
      )}
    </>
  );
}
