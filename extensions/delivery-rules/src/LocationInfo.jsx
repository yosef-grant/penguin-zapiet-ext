import {
  Disclosure,
  Grid,
  GridItem,
  Heading,
  Text,
  TextBlock,
  View,
  Button,
  useApplyAttributeChange,
  useApplyShippingAddressChange,
  InlineStack,
} from "@shopify/ui-extensions-react/checkout";
import { InlineSpacer, List, ListItem } from "@shopify/ui-extensions/checkout";
import { getDay } from "date-fns";
import React, { useState } from "react";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const LocationInfo = ({
  location,
  setLoading,
  setDisplayCalendar,
  setPenguinCart,
  setMinDate,
  pathway,
  cart,
  nextDay,
  url,
  confirmLocation,
  removeLocation,
}) => {
  const changeAttributes = useApplyAttributeChange();
  const changeShippingAddress = useApplyShippingAddressChange();

  const handleFinalLocationSelect = async () => {
    setLoading(true);
    // setDisplayCalendar((displayCalender) => {
    //   return displayCalender ? false : null;
    // });

    let targetLocationAddr = {
      address1: location.info.address_line_1,
      city: location.info.city,
      zip: location.info.postal_code,
    };

    await changeAttributes({
      type: "updateAttribute",
      key: "buyer-pathway",
      value: pathway,
    });

    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Location-Id",
      value: `${location.info.id}`,
    });
    await changeAttributes({
      type: "updateAttribute",
      key: "Checkout-Method",
      value: "pickup",
    });

    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Location-Company",
      value: location.info.company_name,
    });
    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Location-Type",
      value: location.info.custom_attribute_1,
    });

    await changeShippingAddress({
      type: "updateShippingAddress",
      address: targetLocationAddr,
    });

    let locData = await getLocationDates(location);

    confirmLocation(locData.dates);
    setDisplayCalendar(true);
    setLoading(false);
  };

  const getLocationDates = async (location) => {
    console.log("heres the location: ", location);
    let resBody = {
      cart: cart,
      locationId: location.info.id,
      locationType: location.info.custom_attribute_1,
      twoDayDelivery: nextDay,
    };

    let res = await fetch(`${url}/pza/pickup-dates-test`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(resBody),
    });
    let data = await res.json();
    console.log(
      "================================= dates for pickup location!",
      data,
      "\n",
      resBody
    );
    data?.cartInfo
      ? (console.log("penguin location was selected!"),
        setPenguinCart(data.cartInfo))
      : null;
    setMinDate(new Date(data.minDate));

    return {
      dates: {
        date: new Date(data.minDate),
        day: getDay(new Date(data.minDate)),
        blackout_dates: data.blackout_dates,
        blackout_days: data.blackout_days,
      },
      location: location,
    };
  };

  return (
    <View
      border={"base"}
      cornerRadius={"base"}
      borderWidth={"base"}
      padding={"base"}
    >
      <Heading level={2}>{location.info.company_name} Opening Times</Heading>
      <Grid
        rows={["fill"]}
        columns={[`${40}%`, `${60}%`]}
        padding={["base", "none", "base", "none"]}
      >
        <GridItem columnSpan={1} rowSpan={1}>
          <List marker={"none"} spacing="tight">
            {weekdays.map((weekday, i) => (
              <ListItem key={`${weekday}${i}`}>
                <Text size={"medium"} emphasis="bold">
                  {weekday.slice(0, 3)}:{" "}
                </Text>
                <Text size="large">
                  {
                    location.location_hours[
                      `${weekday.toLowerCase()}_opening_hours`
                    ]
                  }
                </Text>
              </ListItem>
            ))}
          </List>
        </GridItem>
        <GridItem>
          <TextBlock>{location.location_description}</TextBlock>
        </GridItem>
      </Grid>
      <InlineStack
        inlineAlignment={"center"}
        blockAlignment={"center"}
        padding={["base", "none", "none", "none"]}
      >
        <Button kind="secondary" onPress={() => removeLocation()}>
          Back
        </Button>
        <Button onPress={() => handleFinalLocationSelect()}>Select</Button>
      </InlineStack>
    </View>
  );
};

export default LocationInfo;
