import {
  Icon,
  InlineStack,
  Pressable,
  Text,
  View,
} from "@shopify/ui-extensions-react/checkout";
import { addDays, addYears, format, isAfter, subDays, isSameMonth, isBefore } from "date-fns";
import React, { useEffect, useState } from "react";


const CalendarWeekSelect = ({ today, setToday, dateFormat, setSelectedMonth }) => {
  const [backwardLocked, setBackwardLocked] = useState(false);
  const [forwardLocked, setForwardLocked] = useState(false);

  useEffect(() => {
    format(today, dateFormat) === format(new Date(), dateFormat)
      ? // || isPast(new Date(subDays(today, 6)))
        setBackwardLocked(true)
      : backwardLocked
      ? setBackwardLocked(false)
      : null;

    isAfter(new Date(addDays(today, 6)), addYears(new Date(), 1))
      ? setForwardLocked(true)
      : forwardLocked
      ? setForwardLocked(false)
      : null;
  }, [today]);

  const getWeek = () => {
    const weekStart = format(today, "do MMM").toString();
    const weekEnd = format(addDays(today, 5), "do MMM").toString();

    // console.log(`${weekStart} - ${weekEnd}`);
    return `${weekStart} - ${weekEnd}`;
  };



  const weekBack = () => {
    let weekAgo = new Date(format(subDays(today, 6), dateFormat).toString());

    isSameMonth(weekAgo, new Date(today))
      ? null
      : setSelectedMonth(format(weekAgo, "MMMM yyyy"));

    backwardLocked
      ? null
      : isBefore(new Date(weekAgo), new Date())
      ? setToday(new Date())
      : setToday(weekAgo);
  };
  const weekForward = () => {
    let weekAhead = new Date(format(addDays(today, 6), dateFormat).toString());

    isSameMonth(weekAhead, new Date(today))
      ? null
      : setSelectedMonth(format(weekAhead, "MMMM yyyy"));
    // console.log("going a week forward: ", weekAhead);
    forwardLocked ? null : setToday(weekAhead);
  };

  return (
    <InlineStack
      inlineAlignment={"center"}
      blockAlignment={"center"}
      padding={["extraLoose", "none", "none", "none"]}
    >
      <Pressable onPress={() => weekBack()}>
        <Icon source="arrowLeft" />
      </Pressable>
      <View blockAlignment={"center"}>
        <Text size={"medium"} emphasis="bold">
          {getWeek()}
        </Text>
      </View>
      <Pressable onPress={() => weekForward()}>
        <Icon source="arrowRight" onPress={() => weekForward()} />
      </Pressable>
    </InlineStack>
  );
};

export default CalendarWeekSelect;
