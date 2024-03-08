import {
  Heading,
  List,
  ListItem,
  Text,
  TextBlock,
  View,
  InlineLayout,
  BlockLayout,
  Icon,
} from "@shopify/ui-extensions-react/checkout";
import { InlineStack } from "@shopify/ui-extensions/checkout";
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
      columns={[135, "fill"]}
      spacing={"loose"}
    >
      <View padding={["none", "none", "none", "tight"]}>
        <Heading>Opening Hours</Heading>
        <View padding={["extraTight", "none", "none", "none"]}>
          <BlockLayout>
            {weekdays.map((weekday, i) => (
              <View key={`${weekday}${i}`} position={"relative"}>
                <InlineLayout
                  spacing="extraTight"
                  blockAlignment="center"
                  columns={["auto", "fill"]}
                  inlineAlignment={"end"}
                >
                  {format(new Date(currentDate), "EEEE") === weekday && (
                    <View
                      position={{
                        type: "absolute",
                        inlineStart: -12.5,
                        blockStart: `${50}%`,
                      }}
                      translate={{ block: `${-50}%` }}
                    >
                      <Icon
                        source="arrowRight"
                        size="extraSmall"
                        appearance="accent"
                      />
                    </View>
                  )}
                  <Text
                    size={"base"}
                    emphasis="bold"
                    appearance={
                      format(new Date(currentDate), "EEEE") === weekday
                        ? "accent"
                        : ""
                    }
                  >
                    {`${weekday.slice(0, 3)}: `}
                  </Text>
                  <Text
                    appearance={
                      format(new Date(currentDate), "EEEE") === weekday
                        ? "accent"
                        : ""
                    }
                    size={"base"}
                    // emphasis={
                    //     format(new Date(currentDate), "EEEE") === weekday
                    //     ? "bold"
                    //     : ""
                    // }
                  >
                    {locationHours[`${weekday.toLowerCase()}_opening_hours`]}
                  </Text>
                </InlineLayout>
              </View>
            ))}
          </BlockLayout>
          {/* <List marker={"none"} spacing="tight">
            {weekdays.map((weekday, i) => (
              <ListItem key={`${weekday}${i}`}>
                <InlineLayout spacing="extraTight" blockAlignment="center">
                  {format(new Date(currentDate), "EEEE") === weekday && (
                    <Icon source="arrowRight" size="extraSmall" />
                  )}
                  <Text size={"base"} emphasis="bold">
                    {`${weekday.slice(0, 3)}: `}
                  </Text>
                  <Text
                    size={"base"}
                    // emphasis={
                    //     format(new Date(currentDate), "EEEE") === weekday
                    //     ? "bold"
                    //     : ""
                    // }
                  >
                    {locationHours[`${weekday.toLowerCase()}_opening_hours`]}
                  </Text>
                </InlineLayout>
              </ListItem>
            ))}
          </List> */}
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
