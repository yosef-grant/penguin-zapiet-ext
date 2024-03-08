import {
  Heading,
  List,
  ListItem,
  View,
  TextBlock,
  Disclosure,
  Button,
  Grid,
  GridItem,
} from "@shopify/ui-extensions/checkout";
import { useState } from "react";

const PickupInfoCard = ({ location, checkoutData }) => {
  const getLocationTime = (meridiem) => {
    let day = checkoutData.checkout_date.day;
    return checkoutData.pickup.selectedLocation.location_hours[
      `${day}_${meridiem}_pickup_hours`
    ];
  };

  // console.log(">>>>>>>>>>>>>>>>", checkoutData);
  return (
    <View>
      <TextBlock>
        If you’re ordering for the next day please note your order will be
        available to collect from {getLocationTime("pm")}, otherwise your order
        will be available from {getLocationTime("am")}.
      </TextBlock>
    </View>
  );
};

export default PickupInfoCard;
