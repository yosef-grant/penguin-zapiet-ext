import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  Heading,
  useAttributes,
  useAttributeValues,
  View,
  useAppMetafields,
  useCartLines,
  useApplyAttributeChange,
  useShippingAddress,
  useApplyCartLinesChange,
} from "@shopify/ui-extensions-react/checkout";
import DateSelect from "./Components/DateSelect.jsx";

import { capitalise } from "./helpers/StringFunctions.jsx";
import { useEffect, useState } from "react";

export default reactExtension(
  "purchase.checkout.shipping-option-list.render-before",
  () => <DatePicker />
);

function DatePicker() {
  const selectedMethod = useAttributeValues(["Checkout-Method"])[0];
  const changeAttributes = useApplyAttributeChange();

  const [locationId, setLocationId] = useState(null);
  const [locationType, setLocationType] = useState(null);
  const [locationHandle, setLocationHandle] = useState(null);
  const [availableMethods, setAvailableMethods] = useState(null);

  const attr = useAttributes();

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  let attrStr = JSON.stringify(attributes);

  // const [delDate, setDelDate] = useState(null);

  const delDate = attributes[`${capitalise(selectedMethod)}-Date`];
  const appMeta = useAppMetafields();
  const cart = useCartLines();

  const currentShippingAddress = useShippingAddress();

  const appUrl = `https://founded-ra-nation-beta.trycloudflare.com`;

  const setCartLineAttr = useApplyCartLinesChange();

  // TODO locations dont update when swtiched from locations component
  // * Provide DELIVERY Availability to DatePicker
  useEffect(() => {
    const types = ["pickup", "shipping", "delivery"];

    const x = cart[0].attributes
      .filter((attribute) => attribute.key === "_available_methods")
      .map((filteredAttr) => {
        return filteredAttr.value;
      })[0]
      .split(",")
      .reduce((acc, type) => {
        acc[type] = types.includes(type) ? true : false;
        return acc;
      }, {});
    setAvailableMethods(x);
  }, []);



  useEffect(() => {
    const handleSwitchToPickup = () => {


      setLocationId(attributes["Pickup-Location-Id"]);
      setLocationType(attributes["Pickup-Location-Type"]);
      setLocationHandle(
        attributes["Pickup-Location-Company"]
          .toLowerCase()
          .replaceAll(/\s?[$&+,:;=?@#|'<>.^*()%!-]/gm, "")
          .replaceAll(/\s/gm, "-")
      );
    };

    // selectedMethod === 'pickup' &&
    // attributes['Pickup-Location-Id'] &&
    // attributes['Pickup-Location-Type'] &&
    // attributes['Pickup-Location-Company']
    //   ? handleSwitchToPickup()
    // : null;

    attributes["Pickup-Location-Id"] ? handleSwitchToPickup() : null;
    // console.log('attr from useEffect in datepicker: ', attr, attr["Pickup-Location-Id"])
  }, [attributes["Pickup-Location-Id"]]);

  // const locationId = useAttributeValues(["Pickup-Location-Id"])[0];

  // const locationType = useAttributeValues(["Pickup-Location-Type"])[0];

  // const locationHandle = useAttributeValues(["Pickup-Location-Company"])[0]
  //   .toLowerCase()
  //   .replaceAll(/\s?[$&+,:;=?@#|'<>.^*()%!-]/gm, "")
  //   .replaceAll(/\s/gm, "-");

  return (
    <View>
      {/* <Heading>{`DATEPICKER for ${selectedMethod}`}</Heading> */}
      <>
      <DateSelect
        selectedMethod={selectedMethod}
        locationId={locationId}
        locationType={locationType}
        locationHandle={locationHandle}
        appMeta={appMeta}
        cart={cart}
        appUrl={appUrl}
        changeAttributes={changeAttributes}
        delDate={delDate}
        currentShippingAddress={currentShippingAddress}
        setCartLineAttr={setCartLineAttr}
        attributes={attributes}
        availableMethods={availableMethods}
      />
        {/* {((selectedMethod === "pickup" && locationId && locationType) ||
          (selectedMethod !== "pickup" && currentShippingAddress.zip)) && (
          <DateSelect
            selectedMethod={selectedMethod}
            locationId={locationId}
            locationType={locationType}
            locationHandle={locationHandle}
            appMeta={appMeta}
            cart={cart}
            appUrl={appUrl}
            changeAttributes={changeAttributes}
            delDate={delDate}
            currentShippingAddress={currentShippingAddress}
            setCartLineAttr={setCartLineAttr}
            attributes={attributes}
            availableMethods={availableMethods}
          />
        )} */}
      </>
    </View>
  );
}
