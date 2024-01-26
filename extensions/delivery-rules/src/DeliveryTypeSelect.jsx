import {
  Choice,
  ChoiceList,
  InlineLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  View,
} from "@shopify/ui-extensions-react/checkout";
import React from "react";

const DeliveryTypeSelect = ({
  setDeliveryType,
  deliveryType,
  setCartLineAttr,
  deliveryZone,
  methodData,
  availableMethods,
  cart,
  setBlackoutDates,
}) => {
  console.log("rendered del type select: ", methodData);

  return (
    <View padding={["none", "none", "base", "none"]}>
      <ToggleButtonGroup
        value={deliveryType}
        onChange={async (val) => {
          setDeliveryType(val);
          let lineItemProp =
            val === "driver-delivery"
              ? "D" +
                `${
                  methodData.delivery.delivery_zone !== "unavailable"
                    ? "%" +
                      methodData.delivery.delivery_zone.replace(/[^0-9.]/g, "")
                    : ""
                }`
              : "S";
          setBlackoutDates(
            val === "driver-delivery"
              ? methodData.delivery.blackouts
              : methodData.shipping.blackouts
          );
          await setCartLineAttr({
            type: "updateCartLine",
            id: cart[0].id,
            attributes: [
              {
                key: "_deliveryID",
                value: lineItemProp,
              },
            ],
          });
        }}
      >
        <InlineLayout spacing={"base"}>
          <ToggleButton
            id="driver-delivery"
            disabled={deliveryZone === "unavailable" ? true : false}
          >
            <View
              inlineAlignment="center"
              blockAlignment="center"
              minBlockSize="fill"
            >
              <Text emphasis={deliveryType === "driver-delivery" ? "bold" : ""}>
                {deliveryZone === "unavailable"
                  ? "Driver delivery unavailable for this address"
                  : "Driver Delivery"}
              </Text>
            </View>
          </ToggleButton>
          <ToggleButton
            id="postal"
            disabled={availableMethods.shipping ? false : true}
          >
            <View
              inlineAlignment={"center"}
              blockAlignment="center"
              minBlockSize="fill"
            >
              <Text emphasis={deliveryType === "postal" ? "bold" : ""}>
                {availableMethods.shipping
                  ? "Postal"
                  : "Postal unavailable due to products in basket"}
              </Text>
            </View>
          </ToggleButton>
        </InlineLayout>
      </ToggleButtonGroup>
    </View>
  );
};

export default DeliveryTypeSelect;
