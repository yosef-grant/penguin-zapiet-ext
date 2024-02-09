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

  // const [delDate, setDelDate] = useState(null);

  const delDate = useAttributeValues([`${capitalise(selectedMethod)}-Date`]);
  const appMeta = useAppMetafields();
  const cart = useCartLines();

  const currentShippingAddress = useShippingAddress();

  const appUrl = `https://8961-212-140-232-13.ngrok-free.app`;

  const setCartLineAttr = useApplyCartLinesChange();

  useEffect(() => {
    const x = cart[0].attributes
      .filter((attribute) => attribute.key === "_available_methods")
      .map((filteredAttr) => {
        return filteredAttr.value;
      })[0].split(',');
    console.log("prepping availability: ", x);
    setAvailableMethods(x);
  }, []);

  useEffect(() => {
    setLocationId(
      selectedMethod === "pickup"
        ? useAttributeValues(["Pickup-Location-Id"])[0]
        : null
    );
    setLocationType(
      selectedMethod === "pickup"
        ? useAttributeValues(["Pickup-Location-Type"])[0]
        : null
    );
    setLocationHandle(
      selectedMethod === "pickup"
        ? useAttributeValues(["Pickup-Location-Company"])[0]
            .toLowerCase()
            .replaceAll(/\s?[$&+,:;=?@#|'<>.^*()%!-]/gm, "")
            .replaceAll(/\s/gm, "-")
        : null
    );
  }, [selectedMethod]);

  // const locationId = useAttributeValues(["Pickup-Location-Id"])[0];

  // const locationType = useAttributeValues(["Pickup-Location-Type"])[0];

  // const locationHandle = useAttributeValues(["Pickup-Location-Company"])[0]
  //   .toLowerCase()
  //   .replaceAll(/\s?[$&+,:;=?@#|'<>.^*()%!-]/gm, "")
  //   .replaceAll(/\s/gm, "-");

  return (
    <View>
      <Heading>{`DATEPICKER for ${selectedMethod}`}</Heading>
      <>
        {(selectedMethod === "pickup" && locationId && locationType) ||
        (selectedMethod !== "pickup" && currentShippingAddress.zip) ? (
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
        ) : (
          "fetching data"
        )}
      </>
    </View>
  );
}
