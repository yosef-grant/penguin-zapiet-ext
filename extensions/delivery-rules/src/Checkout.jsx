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
} from "@shopify/ui-extensions-react/checkout";

import QuickCollect from "./QuickCollect.jsx";
import Calendar from "./Calendar.jsx";
import CheckoutMethodSelect from "./CheckoutMethodSelect.jsx";
import { Heading } from "@shopify/ui-extensions/checkout";
import PickupInfoCard from "./PickupInfoCard.jsx";
import CSPortal from "./CSPortal.jsx";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  // checkoutData & methodData are the same?

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

  const lineItems = useCartLines();

  useEffect(() => {
    console.log(":><: THIS IS THE CURRENT PENGUIN CART: ", penguinCart);
  }, [penguinCart]);

  const app_url = "https://8381-212-140-232-13.ngrok-free.app";

  const test = useAttributeValues([
    "Checkout-Method",
    "Pickup-Location-Company",
    "Pickup-Location-Type",
    "Pickup-Date",
    "Pickup-AM-Hours",
    "Pickup-PM-Hours",
    "Pickup-Location-Id",
  ]);

  const { extension } = useApi();

  // console.log("@@@@@@@@@@@@ capabilities ", extension);
  const attr = useAttributes();

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

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
      {!!cs.status && (
        <CSPortal setCS={setCS} cs={cs} allLocations={allLocations} />
      )}
      {!checkoutData?.delivery && (
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
        />
      )}

      {!checkoutData?.qCollect && (
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
        />
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
