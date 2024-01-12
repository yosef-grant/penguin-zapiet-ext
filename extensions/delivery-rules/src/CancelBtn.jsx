import { Icon, View } from "@shopify/ui-extensions-react/checkout";
import { Pressable } from "@shopify/ui-extensions/checkout";
import React from "react";

const CancelBtn = ({handler, centered}) => {
  return (
    <View
      position={{
        type: centered ? "relative" : "absolute",
        blockStart: centered ? '' : `${0}%`,
        inlineEnd: centered ? '' : 0,
      }}
    >
      <Pressable
        onPress={() => handler()}
        border={"base"}
        cornerRadius={"fullyRounded"}
        backgroud={"subdued"}
        padding={"extraTight"}
        inlineAlignment={"center"}
        blockAlignment={"center"}
      >
        <Icon source="close" appearance={"critical"} />
      </Pressable>
    </View>
  );
};

export default CancelBtn;
