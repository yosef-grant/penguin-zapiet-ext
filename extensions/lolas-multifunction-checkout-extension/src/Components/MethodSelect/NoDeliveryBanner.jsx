import {
  Banner,
  Button,
  Text,
  View,
} from "@shopify/ui-extensions-react/checkout";
import React from "react";

const NoDeliveryBanner = ({ availableMethods }) => {
  return (
    <View minInlineSize={"fill"} padding={["tight", "none", "none", "none"]}>
      <Banner status="warning">
        <Text size="base" emphasis="bold">
          Delivery is not available for this address. Try an alternative address
          or{" "}
          <Button
            kind="plain"
            onPress={() => handleMethodSelect("pickup", availableMethods)}
          >
            <Text>switch to collection</Text>
          </Button>
        </Text>
      </Banner>
    </View>
  );
};

export default NoDeliveryBanner;
