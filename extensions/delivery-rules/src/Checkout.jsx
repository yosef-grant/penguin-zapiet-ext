import React, { useEffect, useState, useLayoutEffect } from "react";

import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  BlockSpacer,
  Grid,
  View,
  Image,
  Button,
  useApplyShippingAddressChange,
  useCartLines,
  useShippingAddress,
  useAppMetafields,
  useMetafield,
  useAttributeValues,
  useAttributes,
} from "@shopify/ui-extensions-react/checkout";

import QuickCollect from "./QuickCollect.jsx";
import Calendar from "./Calendar.jsx";
import CheckoutMethodSelect from "./CheckoutMethodSelect.jsx";
import { Heading } from "@shopify/ui-extensions/checkout";
import PickupInfoCard from "./PickupInfoCard.jsx";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const [qCollectLocation, setQCollectLocation] = useState(null);
  const [checkoutData, setCheckoutData] = useState({});
  const [minDate, setMinDate] = useState(null);
  const [nextDay, setNextDay] = useState(false);
  const [availableMethods, setAvailableMethods] = useState(null);
  const [penguinCart, setPenguinCart] = useState(null);
  const [lockerReserved, setLockerReserved] = useState(false);
  const [collectLocation, setCollectLocation] = useState(null);
  const [attrList, setAttrList] = useState([]);
  const [postcode, setPostcode] = useState(null);
  const [methodData, setMethodData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const { extension } = useApi();
  const translate = useTranslate();
  const lineItems = useCartLines();

  useEffect(() => {
    console.log(":><: THIS IS THE CURRENT PENGUIN CART: ", penguinCart);
  }, [penguinCart]);

  const app_url = "https://0eec-212-140-232-13.ngrok-free.app";

  const test = useAttributeValues([
    "Checkout-Method",
    "Pickup-Location-Company",
    "Pickup-Location-Type",
    "Pickup-Date",
    "Pickup-AM-Hours",
    "Pickup-PM-Hours",
    "Pickup-Location-Id",
  ]);

  const attr = useAttributes();
  console.log("::::::::::::::::: attributes: ", attr, "\nVals: ", test);

  const cart = lineItems.map((item) => {
    return {
      variant_id: item.merchandise.id.replace(/\D/g, ""),
      product_id: item.merchandise.product.id.replace(/\D/g, ""),
      quantity: item.quantity,
    };
  });
  const changeShippingAddress = useApplyShippingAddressChange();

  const shippingAddress = useShippingAddress();

  return (
    <>
      {!methodData && (
        <QuickCollect
          lineItems={lineItems}
          changeShippingAddress={changeShippingAddress}
          setQCollectLocation={setQCollectLocation}
          qCollectLocation={qCollectLocation}
          cart={cart}
          setCheckoutData={setCheckoutData}
          setMinDate={setMinDate}
          nextDay={nextDay}
          url={app_url}
          setNextDay={setNextDay}
          setAttrList={setAttrList}
          penguinCart={penguinCart}
          setPenguinCart={setPenguinCart}
          setAvailableMethods={setAvailableMethods}
          setSelectedMethod={setSelectedMethod}
        />
      )}
      {!qCollectLocation && (
        <CheckoutMethodSelect
          availableMethods={availableMethods}
          postcode={postcode}
          setPostcode={setPostcode}
          cart={cart}
          nextDay={nextDay}
          url={app_url}
          setAddress={changeShippingAddress}
          setMethodData={setMethodData}
          methodData={methodData}
          setSelectedMethod={setSelectedMethod}
          selectedMethod={selectedMethod}
          setCheckoutData={setCheckoutData}
          setMinDate={setMinDate}
          setPenguinCart={setPenguinCart}
          setCollectLocation={setCollectLocation}
          collectLocation={collectLocation}
        />
      )}
      {!!minDate && (
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
          {!!checkoutData?.location_hours &&
            !!checkoutData?.checkout_date &&
            (qCollectLocation || collectLocation) && (
              <PickupInfoCard
                location={qCollectLocation ? qCollectLocation : collectLocation}
                checkoutData={checkoutData}
              />
            )}
        </>
      )}
    </>
  );
}
