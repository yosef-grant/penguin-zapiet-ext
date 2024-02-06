import {
  reactExtension,
  useCartLineTarget,
} from "@shopify/ui-extensions-react/checkout";
import { Text } from "@shopify/ui-extensions/checkout";
import React from "react";

export default reactExtension(
  "purchase.checkout.cart-line-item.render-after", () =>
  <LineItemProperties />
);

const LineItemProperties = () => {
  const currentItem = useCartLineTarget();

  return (
    <>
      {currentItem.attributes.map((attribute) => {
        return attribute.key === "_Personalisation Message" &&
          attribute.value ? (
          <>
            <Text emphasis="bold" size="small">
              Personalised Message:{" "}
            </Text>
            <Text size="small">{attribute.value}</Text>
          </>
        ) : null;
      })}
    </>
  );
};
