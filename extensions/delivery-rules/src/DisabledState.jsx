import { Text, View, Icon } from "@shopify/ui-extensions-react/checkout";
import React from "react";

const DisabledState = () => {
  return (
    <View
      minBlockSize={75}
      inlineAlignment={"center"}
      blockAlignment={"center"}
    >
      <Icon source="infoFill" size="large" />
      <Text size="large">Unavailable whilst using Select Method</Text>
    </View>
  );
};

export default DisabledState;
