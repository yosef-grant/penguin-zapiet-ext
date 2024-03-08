import { Spinner, Text, View } from "@shopify/ui-extensions-react/checkout";
import { SkeletonImage } from "@shopify/ui-extensions/checkout";
import React from "react";

const BlockLoader = ({message}) => {
  return (
    <View position={"relative"}>
      <SkeletonImage blockSize={50} inlineSize={"fill"} aspectRatio={2} />
      <View
        position={{
          type: "absolute",
          inlineStart: `${50}%`,
          blockStart: `${50}%`,
        }}
        translate={{ block: `${-50}%`, inline: `${-50}%` }}
        minBlockSize={"fill"}
        minInlineSize={"fill"}
        inlineAlignment={"center"}
        blockAlignment={"center"}
      >
        <View maxBlockSize={75} maxInlineSize={75} padding={["none", "none", "tight", "none"]}>
          <Spinner size="fill" accessibilityLabel={message} />
        </View>
        <Text size="medium">{message}</Text>
      </View>
    </View>
  );
};

export default BlockLoader;
