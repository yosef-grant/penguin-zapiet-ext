import {
  BlockLayout,
  BlockStack,
  Button,
  Heading,
  Icon,
  InlineLayout,
  InlineStack,
  Text,
  View,
  Select,
  Banner,
} from "@shopify/ui-extensions-react/checkout";

import React, { useEffect, useState } from "react";

import {
  addDays,
  format,
  getMonth,
  isBefore,
  parse,
  parseISO,
  subDays,
  addMonths,
  differenceInDays,
  startOfMonth,
  isThisMonth,
  getDay,
  isAfter,
  addYears,
  isPast,
  isSameMonth,
} from "date-fns";
import { Grid, Pressable, TextBlock } from "@shopify/ui-extensions/checkout";

const days = Array.apply(null, Array(6)).map(() => {});
const months = Array.apply(null, Array(13)).map(() => {});
const AltCalendar = ({ methodData, attributes }) => {
  const [minDate, setMinDate] = useState(
    methodData.minDate || methodData.delivery.min_date
  );
  const [today, setToday] = useState(new Date());
  const [backwardLocked, setBackwardLocked] = useState(false);
  const [forwardLocked, setForwardLocked] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const dateFormat = "yyyy-MM-dd";

  console.log("MINDATE IN CAL: ", minDate);

  const getHeading = () => {
    return attributes["Checkout-Method"] === "pickup"
      ? "Collection Date"
      : "Delivery Date";
  };

  useEffect(() => {
    console.log(
      "todays current value: ",
      today,
      format(new Date(addDays(today, 0)), minDate),
      minDate
    );

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

    console.log(
      "forward in time: ",
      new Date(addDays(today, 5)),
      addYears(new Date(), 1),
      isAfter(new Date(addDays(today, 6)), addYears(new Date(), 1))
    );
  }, [today]);

  const getWeek = () => {
    const weekStart = format(today, "do MMM").toString();
    const weekEnd = format(addDays(today, 5), "do MMM").toString();

    console.log(`${weekStart} - ${weekEnd}`);
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
    console.log("weekback: ", today, new Date(), backwardLocked);
  };
  const weekForward = () => {
    let weekAhead = new Date(format(addDays(today, 6), dateFormat).toString());

    isSameMonth(weekAhead, new Date(today))
      ? null
      : setSelectedMonth(format(weekAhead, "MMMM yyyy"));
    console.log("going a week forward: ", weekAhead);
    forwardLocked ? null : setToday(weekAhead);
  };

  const setSelectedDate = (date) => {
    console.log("new date: ", date);
    setSelected(date);
  };

  const handleMonthChange = (value) => {
    console.log("month has been changed! ", value);
    setSelectedMonth(value);

    !isThisMonth(new Date(value))
      ? setToday(new Date(value))
      : setToday(new Date());
  };

  const isDateDisabled = (date) => {
    console.log(" 1 year in the future: ", addYears(new Date(), 1));
    if (
      isBefore(new Date(date), new Date(minDate)) ||
      isAfter(new Date(date), addYears(new Date(), 1))
    ) {
      return true;
    } else {
      return methodData.blackout_dates.includes(date) ||
        methodData.blackout_dates.includes(getDay(new Date(date)) + 1)
        ? true
        : false;
    }
  };

  return (
    <View>
      <InlineLayout blockAlignment={"center"} columns={["auto", "fill"]} >
        <Heading level={2}>{getHeading()}</Heading>
        <View inlineAlignment={"end"}>
          <Banner
            status="critical"
            title={`Selected date: ${
              selected
                ? format(new Date(selected), "do MMMM yyyy")
                : format(new Date(minDate), "do MMMM yyyy")
            }`}
          />
        </View>
      </InlineLayout>
      <InlineStack inlineAlignment={"center"} blockAlignment={"center"}>
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
      <Grid
        columns={["fill", "fill", "fill", "fill", "fill", "fill"]}
        rows={["auto", "auto"]}
        padding={["base", "none", "base", "none"]}
      >
        {days.map((day, i) => (
          <View
            inlineAlignment={"center"}
            blockAlignment={"center"}
            minBlockSize={30}
          >
            <Text
              emphasis={
                (!selected &&
                  format(addDays(today, i), dateFormat) === minDate) ||
                selected === format(addDays(today, i), dateFormat)
                  ? "bold"
                  : ""
              }
            >
              {format(addDays(today, i), "EEE").toString()}
            </Text>
          </View>
        ))}
        {days.map((day, i) => (
          <View
            inlineAlignment={"center"}
            blockAlignment={"center"}
            minBlockSize={30}
            minInlineSize={50}
          >
            <Button
              kind={
                (!selected &&
                  format(new Date(addDays(today, i)), dateFormat) ===
                    minDate) ||
                (selected &&
                  selected === format(new Date(addDays(today, i)), dateFormat))
                  ? "primary"
                  : "secondary"
              }
              disabled={isDateDisabled(format(addDays(today, i), dateFormat))}
              onPress={() =>
                setSelectedDate(format(new Date(addDays(today, i)), dateFormat))
              }
            >
              <Text>{format(addDays(today, i), "d").toString()}</Text>
            </Button>
          </View>
        ))}
      </Grid>
      <Select
        label="Month"
        value={selectedMonth ? selectedMonth : format(new Date(), "MMMM yyyy")}
        onChange={(val) => handleMonthChange(val)}
        options={months.map((month, i) => {
          if (i === 0) {
            return {
              value: `${format(new Date(), "MMMM yyyy")}`,
              label: `${format(new Date(), "MMMM yyyy")}`,
            };
          } else {
            return {
              value: `${format(addMonths(new Date(), i), "MMMM yyyy")}`,
              label: `${format(addMonths(new Date(), i), "MMMM yyyy")}`,
            };
          }
        })}
      />
    </View>
  );
};

export default AltCalendar;
