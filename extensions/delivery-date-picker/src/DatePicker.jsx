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
} from "@shopify/ui-extensions-react/checkout";
import DateSelect from "./Components/DateSelect.jsx";

import { capitalise } from "./helpers/StringFunctions.jsx";

export default reactExtension(
  "purchase.checkout.shipping-option-list.render-before",
  () => <DatePicker />
);

function DatePicker() {
  const selectedMethod = useAttributeValues(["Checkout-Method"])[0];
  const changeAttributes = useApplyAttributeChange();
  const delDate = useAttributeValues([`${capitalise(selectedMethod)}-Date`]);

  const appMeta = useAppMetafields();
  const cart = useCartLines();

  const appUrl = `https://3f22-212-140-232-13.ngrok-free.app`;

  const locationId =
    selectedMethod === "pickup"
      ? useAttributeValues(["Pickup-Location-Id"])[0]
      : null;
  const locationType =
    selectedMethod === "pickup"
      ? useAttributeValues(["Pickup-Location-Type"])[0]
      : null;

  const translate = useTranslate();
  const { extension } = useApi();

  return (
    <View>
      <Heading>{`DATEPICKER for ${selectedMethod}`}</Heading>
      {selectedMethod === "pickup" ? (
        <>
          {locationId && locationType ? (
            <DateSelect
              selectedMethod={selectedMethod}
              locationId={locationId}
              locationType={locationType}
              appMeta={appMeta}
              cart={cart}
              appUrl={appUrl}
              changeAttributes={changeAttributes}
              delDate={delDate}
            />
          ) : (
            "fetching data"
          )}
        </>
      ) : (
        <Heading>Delivery</Heading>
      )}
    </View>
  );
}
