import {
  Heading,
  List,
  ListItem,
  Text,
  TextBlock,
  View,
  InlineLayout,
} from "@shopify/ui-extensions-react/checkout";
import { format } from "date-fns";
import React from "react";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const OpeningHours = ({ locationHours, locationDescription, currentDate }) => {
  const getOpeningTime = () => {
    let day = format(new Date(currentDate), "EEEE").toLowerCase();
    let openingTime = locationHours[`${day}_opening_hours`];
    return openingTime;
  };

  return (
    <InlineLayout
      padding={["base", "none", "base", "none"]}
      columns={["auto", "fill"]}
      spacing={"base"}
    >
      <View>
        <Heading>Opening Hours</Heading>
        <View padding={["extraTight", "none", "none", "none"]}>

        <List marker={"none"} spacing="tight">
          {weekdays.map((weekday, i) => (
              <ListItem key={`${weekday}${i}`}>
              <Text size={"base"} emphasis="bold">
                {`${weekday.slice(0, 3)}: `}
              </Text>
              <Text
                size="base"
                emphasis={
                    format(new Date(currentDate), "EEEE") === weekday
                    ? "bold"
                    : ""
                }
                >
                {locationHours[`${weekday.toLowerCase()}_opening_hours`]}
              </Text>
            </ListItem>
          ))}
        </List>
          </View>
      </View>
      <View>
        <Heading>Where to find</Heading>
        <TextBlock>{locationDescription}</TextBlock>
      </View>
    </InlineLayout>
  );
};

export default OpeningHours;
