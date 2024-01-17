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
} from "date-fns";
import { Grid, Pressable, TextBlock } from "@shopify/ui-extensions/checkout";

const days = Array.apply(null, Array(6)).map(() => {});
const AltCalendar = ({ methodData, attributes }) => {
  const [minDate, setMinDate] = useState(
    methodData.minDate || methodData.delivery.min_date
  );
  const [today, setToday] = useState(new Date());
  const [locked, setLocked] = useState(false);
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
      ? setLocked(true)
      : locked
      ? setLocked(false)
      : null;
  }, [today]);

  const getWeek = () => {
    const weekStart = format(today, "do MMM").toString();
    const weekEnd = format(addDays(today, 5), "do MMM").toString();

    console.log(`${weekStart} - ${weekEnd}`);
    return `${weekStart} - ${weekEnd}`;
  };

  const weekBack = () => {
    let weekAgo = new Date(format(subDays(today, 6), dateFormat).toString());

    locked ? null : setToday(weekAgo);
    console.log("weekback: ", today, new Date(), locked);
  };
  const weekForward = () => {
    let weekAhead = new Date(format(addDays(today, 6), dateFormat).toString());
    console.log("going a week forward: ", weekAhead);
    setToday(weekAhead);
  };

  const setSelectedDate = (date) => {
    console.log("new date: ", date);
    setSelected(date);
  };

  const handleMonthChange = (value) => {
    console.log("month has been changed! ", value);
    value ? setToday(new Date(value)) : setToday(new Date());
  };

  return (
    <View>
      <Heading level={2}>{getHeading()}</Heading>
      <InlineStack>
        <Pressable onPress={() => weekBack()}>
          <Icon source="arrowLeft" />
        </Pressable>
        <View>{getWeek()}</View>
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
            <Text>{format(addDays(today, i), "EEE").toString()}</Text>
          </View>
        ))}
        {days.map((day, i) => (
          <View
            inlineAlignment={"center"}
            blockAlignment={"center"}
            minBlockSize={30}
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
              disabled={
                isBefore(new Date(addDays(today, i)), new Date(minDate))
                // format(new Date(addDays(today, i)), dateFormat) ===
                // format(new Date(), dateFormat)
                //   ? true
                //   : false
              }
              onPress={() =>
                setSelectedDate(format(new Date(addDays(today, i)), dateFormat))
              }
            >
              <Text>{format(addDays(today, i), "d").toString()}</Text>
            </Button>

            {/* <Pressable
              inlineAligment={"center"}
              background={
                format(new Date(addDays(today, i)), dateFormat) ===
                format(today, dateFormat)
                  ? "subdued"
                  : format(new Date(addDays(today, i)), dateFormat) === minDate
                  ? "base"
                  : ""
              }
             
            >
              <Text>{format(addDays(today, i), "d").toString()}</Text>
            </Pressable> */}
          </View>
        ))}
      </Grid>
      <Select
        label="Month"
        value={`Testing`}
        onChange={(val) => handleMonthChange(val)}
        options={[
          {
            value: '',
            label: `${format(new Date(), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 1)), dateFormat),
            label: `${format(addMonths(new Date(), 1), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 2)), dateFormat),
            label: `${format(addMonths(new Date(), 2), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 3)), dateFormat),
            label: `${format(addMonths(new Date(), 3), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 4)), dateFormat),
            label: `${format(addMonths(new Date(), 4), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 5)), dateFormat),
            label: `${format(addMonths(new Date(), 5), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 6)), dateFormat),
            label: `${format(addMonths(new Date(), 6), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 7)), dateFormat),
            label: `${format(addMonths(new Date(), 7), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 8)), dateFormat),
            label: `${format(addMonths(new Date(), 8), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 9)), dateFormat),
            label: `${format(addMonths(new Date(), 9), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 10)), dateFormat),
            label: `${format(addMonths(new Date(), 10), "MMMM yyyy")}`,
          },
          {
            value: format(startOfMonth(addMonths(new Date(), 11)), dateFormat),
            label: `${format(addMonths(new Date(), 11), "MMMM yyyy")}`,
          },
        ]}
      />

      <Heading>Selected: {!selected ? minDate : selected}</Heading>
    </View>
  );
};

export default AltCalendar;
