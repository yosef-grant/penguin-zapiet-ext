import { InlineLayout, Text } from "@shopify/ui-extensions-react/checkout";
import React, { useState } from "react";

const MethodBtns = ({
  checkoutMethod,
  handleMethodSelect,
  availableMethods,
}) => {
  const [methodHover, setMethodHover] = useState(false);

  const ButtonTagOne = checkoutMethod === "pickup" ? "Button" : "Pressable";
  const ButtonTagTwo = checkoutMethod === "pickup" ? "Pressable" : "Button";

  return (
    <InlineLayout spacing={"tight"} padding={["base", "none", "none", "none"]}>
      <ButtonTagOne
        {...(ButtonTagOne === "Pressable" && {
          inlineAlignment: "center",
          blockAlignment: "center",
          cornerRadius: "base",
          onPointerEnter: () => setMethodHover(true),
          onPointerLeave: () => setMethodHover(false),
          minBlockSize: 50,
          border: "base",
          background: methodHover ? "subdued" : "transparent",
        })}
        onPress={() =>
          checkoutMethod !== "pickup"
            ? handleMethodSelect("pickup", availableMethods)
            : null
        }
      >
        Collection
      </ButtonTagOne>
      <ButtonTagTwo
        {...(ButtonTagTwo === "Pressable" && {
          inlineAlignment: "center",
          blockAlignment: "center",
          cornerRadius: "base",
          onPointerEnter: () => setMethodHover(true),
          onPointerLeave: () => setMethodHover(false),
          minBlockSize: 50,
          border: "base",
          background: methodHover ? "subdued" : "transparent",
        })}
        onPress={() =>
          checkoutMethod === "pickup"
            ? handleMethodSelect("delivery", availableMethods)
            : null
        }
      >
        <Text size="medium" emphasis="bold">
          Delivery
        </Text>
      </ButtonTagTwo>
    </InlineLayout>
  );
};

export default MethodBtns;
