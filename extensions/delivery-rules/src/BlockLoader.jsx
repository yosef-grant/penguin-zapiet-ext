import { Spinner, View } from "@shopify/ui-extensions-react/checkout";
import { SkeletonImage } from "@shopify/ui-extensions/checkout";
import React from "react";

const BlockLoader = () => {
  return (
    <View position={"relative"}>
      <SkeletonImage blockSize={50} inlineSize={"fill"} aspectRatio={2} />
      <View
        maxBlockSize={75}
        maxInlineSize={75}
        position={{
          type: "absolute",
          inlineStart: `${50}%`,
          blockStart: `${50}%`,
        }}
        translate={{ block: `${-50}%`, inline: `${-50}%` }}
      >
        <Spinner size="fill" accessibilityLabel="Getting pickup locations" />
      </View>
    </View>
  );
};

export default BlockLoader;
