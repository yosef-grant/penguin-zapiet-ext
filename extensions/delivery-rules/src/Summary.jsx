import {
  Heading,
  View,
  Button,
  useApplyShippingAddressChange,
  Divider,
} from "@shopify/ui-extensions-react/checkout";
import React from "react";
import { format } from "date-fns";
import CancelBtn from "./CancelBtn.jsx";

const df = "EEEE',' do MMMM yyyy";
const Summary = ({
  selectedMethod,
  checkoutData,
  postcode,
  buPostcode,
  setOptionsConfirmed,
  setSelectedMethod,
  removeLocation,
}) => {
  console.log(
    "&*&^ ",
    checkoutData.checkout_date.date,
    new Date(checkoutData.checkout_date.date),
    "\n heres the backup postcode: ",
    buPostcode
  );

  const changeShippingAddress = useApplyShippingAddressChange();

  const formatMethod = () => {
    return selectedMethod === "pickup"
      ? `Collecting from ${
          checkoutData.pickup.selectedLocation.info.company_name
        } on ${format(new Date(checkoutData.checkout_date.date), df)}`
      : selectedMethod === "delivery"
      ? `Delivery to ${postcode} on ${format(
          new Date(checkoutData.checkout_date.date),
          df
        )}`
      : `Postal to ${postcode} on ${format(
          new Date(checkoutData.checkout_date.date),
          df
        )}`;
  };

  const optionsReset = async () => {
    setOptionsConfirmed(false);
    await changeShippingAddress({
      type: "updateShippingAddress",
      address: buPostcode,
    });
  };

  return (
    <View
      padding={"base"}
      border={"base"}
      cornerRadius={"base"}
      inlineAlignment={"center"}
    >
      {/* DELIVERY METHOD GREETING */}

      <Heading>{formatMethod()}</Heading>

      <View
        maxInlineSize={`${50}%`}
        minInlineSize={`${50}%`}
        padding={["base", "none", "base", "none"]}
      >
        <Divider />
      </View>
      <CancelBtn handler={optionsReset} centered/>
    </View>
  );
};

export default Summary;
