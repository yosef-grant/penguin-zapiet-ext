import { Text, TextBlock } from "@shopify/ui-extensions-react/checkout";
import { format } from "date-fns";
import React from "react";

const CalendarLocationInfo = ({
  selected,
  minDate,
  locationHours,
  attributes,
  getPickupTime,
}) => {
  return (
    <TextBlock>
      On{" "}
      <Text emphasis="bold">
        {format(new Date(selected ? selected : minDate), "EEEE")}{" "}
      </Text>
      the{" "}
      <Text>
        {attributes["Pickup-Location-Type"] === "lockers" ? "locker" : "store"}{" "}
      </Text>
      opening hours are{" "}
      <Text emphasis="bold">
        {
          locationHours[
            `${format(
              new Date(selected ? selected : minDate),
              "EEEE"
            ).toLowerCase()}_opening_hours`
          ]
        }
      </Text>
      . If you’re ordering for the next day please note your order will be
      available to collect from{" "}
      <Text emphasis="bold">
        {getPickupTime(selected ? selected : minDate, "pm")}
      </Text>
      , otherwise your order will be available to collect from{" "}
      <Text emphasis="bold">
        {getPickupTime(selected ? selected : minDate, "am")}.
      </Text>
    </TextBlock>
  );
};

export default CalendarLocationInfo;
