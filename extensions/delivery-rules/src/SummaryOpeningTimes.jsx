import {
    Button,
    Disclosure,
  Heading,
  List,
  ListItem,
  Text,
  View,
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

const SummaryOpeningTimes = ({ attributes, storedData }) => {
  const getOpeningTime = () => {
    let day = format(new Date(attributes["Pickup-Date"]), "EEEE").toLowerCase();
    let openingTime = storedData.hours[`${day}_opening_hours`];

    return openingTime;
  };
  return (
    <>
      <Heading>{`${attributes["Pickup-Location-Company"]} Opening Times`}</Heading>
      <Heading>On selected date:</Heading>
      <Text>{getOpeningTime()}</Text>

      <View>
        <Disclosure>
          <Button toggles="test">See all opening times</Button>
          <View id="test">
            <List marker={"none"} spacing="tight">
              {weekdays.map((weekday, i) => (
                <ListItem key={`${weekday}${i}`}>
                  <Text size={"base"} emphasis="bold">
                    {`${weekday.slice(0, 3)}: `}
                  </Text>
                  <Text size="base">
                    {storedData.hours[`${weekday.toLowerCase()}_opening_hours`]}
                  </Text>
                </ListItem>
              ))}
            </List>
          </View>
        </Disclosure>
      </View>
    </>
  );
};

export default SummaryOpeningTimes;
