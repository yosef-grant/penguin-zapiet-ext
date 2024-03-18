import {
  Banner,
  BlockStack,
  Heading,
  Icon,
  InlineLayout,
  InlineStack,
  Text,
  View,
} from "@shopify/ui-extensions-react/checkout";
import { format } from "date-fns";
import React from "react";
import { capitalise } from "../../../helpers/StringFunctions.jsx";

const CalendarHeader = ({
  selectedMethod,
  attributes,
  currentShippingAddress,
  selected,
  minDate,
  deliveryType,
}) => {
  const formatDeliveryType = () => {
    return deliveryType
      .split("-")
      .map((y) => {
        return capitalise(y);
      })
      .join(" ");
  };

  return (
    <InlineLayout blockAlignment={"start"} columns={["auto", "fill"]}>
      <BlockStack spacing={"extraTight"}>
        <Heading level={1}>
          {selectedMethod === "pickup" ? "Collection Date" : "Delivery Date"}
        </Heading>
        {selectedMethod === "pickup" ? (
          <Text size={"base"}>
            {attributes["Pickup-Location-Company"].replaceAll(/\s-\s/gm, " ")}
          </Text>
        ) : (
          <Text>
            {formatDeliveryType()} to {currentShippingAddress.zip}
          </Text>
        )}
      </BlockStack>
      <View inlineAlignment={"end"} blockAlignment={"start"}>
        <InlineStack blockAlignment={"center"} spacing={"tight"}>
          <Icon source="calendar" />
          <Text emphasis="bold" size="medium">
            {`Selected date: ${
              selected
                ? format(new Date(selected), "do MMMM yyyy")
                : format(new Date(minDate), "do MMMM yyyy")
            }`}
          </Text>
        </InlineStack>
        {/* <Banner
          status="critical"
          title={`Selected date: ${
            selected
              ? format(new Date(selected), "do MMMM yyyy")
              : format(new Date(minDate), "do MMMM yyyy")
          }`}
        /> */}
      </View>
    </InlineLayout>
  );
};

export default CalendarHeader;