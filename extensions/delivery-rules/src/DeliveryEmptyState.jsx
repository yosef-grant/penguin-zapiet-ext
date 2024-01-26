import {
  Banner,
  View,
  Text,
  Button,
  BlockLayout,
  Grid,
} from "@shopify/ui-extensions-react/checkout";
import {} from "@shopify/ui-extensions/checkout";
import React, { useEffect } from "react";

const DeliveryEmptyState = ({ handleMethodSelect }) => {
  const handlePress = () => {
    console.log("resetting extension, will restart with collection");

    handleMethodSelect("pickup");
  };


  return (
    <View>
      <Banner
        status="warning"
        title="Delivery isn't available for the address you've entered."
      >
        <Grid>
          <Button kind="secondary" onPress={() => handlePress()}>
            <Text emphasis="bold">Switch to Collection</Text>
          </Button>
        </Grid>
      </Banner>
    </View>
  );
};

export default DeliveryEmptyState;
