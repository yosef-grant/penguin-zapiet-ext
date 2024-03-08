import { Spinner, Text, View } from "@shopify/ui-extensions-react/checkout";

import React from "react";
import NoDeliveryBanner from "./NoDeliveryBanner.jsx";

const DeliveryCheckStatus = ({
  showDeliveryError,
  noDelivery,
  availableMethods,
  checkingPostcode,
}) => {
  return (
    <View
      padding={["tight", "none", "none", "none"]}
      inlineAlignment={"center"}
    >
      {!!showDeliveryError || !!noDelivery ? (
        <NoDeliveryBanner availableMethods={availableMethods} />
      ) : (
        <>
          {!checkingPostcode ? (
            <>
              <Text emphasis="bold" size="base">
                Enter delivery address below
              </Text>
            </>
          ) : (
            <>
              <Text emphasis="bold" size="base">
                Checking address...
              </Text>
              <View padding={["tight", "none", "none", "none"]}>
                <Spinner></Spinner>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
};

export default DeliveryCheckStatus;
