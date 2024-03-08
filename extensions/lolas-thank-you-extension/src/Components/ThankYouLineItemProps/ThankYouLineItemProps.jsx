//*  Code is identical to summary for checkout

import { Text, useCartLineTarget } from "@shopify/ui-extensions-react/checkout";
import React from "react";

const ThankYouLineItemProps = () => {
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

export default ThankYouLineItemProps;
