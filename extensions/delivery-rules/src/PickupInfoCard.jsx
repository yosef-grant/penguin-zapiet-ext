import {
  Heading,
  List,
  ListItem,
  View,
  TextBlock,
  Disclosure,
  Button,
} from "@shopify/ui-extensions/checkout";
import { useState } from "react";

const PickupInfoCard = ({ location, checkoutData }) => {
  const [toggled, setToggled] = useState(false);

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getLocationTime = (meridiem) => {
    let day = checkoutData.checkout_date.day;
    return checkoutData.location_hours[`${day}_${meridiem}_pickup_hours`];
  };

  console.log(">>>>>>>>>>>>>>>>", checkoutData);
  return (
    <View>
      <Heading>{location.company_name} Opening & Pickup Times</Heading>
      <List marker="none">
        {weekdays.map((weekday) => (
          <ListItem>
            {weekday}:{" "}
            {
              checkoutData.location_hours[
                `${weekday.toLowerCase()}_opening_hours`
              ]
            }
          </ListItem>
        ))}
      </List>
      <TextBlock>
        If you’re ordering for the next day please note your order will be
        available to collect from {getLocationTime("pm")}, otherwise your order
        will be available from {getLocationTime("am")}.
      </TextBlock>
      <Disclosure>
        <Button
          kind="plain"
          toggles="location-info"
          onPress={() => setToggled(!toggled)}
        >
          {toggled ? "Less info" : "More info"}
        </Button>
        <View id="location-info">
          <TextBlock>{checkoutData.location_description}</TextBlock>
        </View>
      </Disclosure>
    </View>
  );
};

export default PickupInfoCard;
