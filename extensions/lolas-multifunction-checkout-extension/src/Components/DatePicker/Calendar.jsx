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
  TextBlock,
  Pressable,
  useDeliveryGroups,
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
import { Grid } from "@shopify/ui-extensions/checkout";
import { capitalise } from "../../helpers/StringFunctions.jsx";

import OpeningHours from "./OpeningHours.jsx";
import LockerReserve from "./LockerReserve.jsx";

const days = Array.apply(null, Array(6)).map(() => {});
const months = Array.apply(null, Array(13)).map(() => {});

const Calendar = ({
  // methodData,
  // deliveryType,

  minDate,
  blackoutDates,
  locationHours,
  locationDescription,
  selectedMethod,
  changeAttributes,
  delDate,
  deliveryType,
  attributes,
  currentShippingAddress,
  setCartLineAttr,
  cart,
  penguinCart,
  url,
  // pickupLocationInfo,
  // changeAttributes,
  // localStorage,
}) => {
  const [today, setToday] = useState(new Date());
  const [backwardLocked, setBackwardLocked] = useState(false);
  const [forwardLocked, setForwardLocked] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [pickupTimes, setPickupTimes] = useState(null);

  const [currentHover, setCurrentHover] = useState(null);

  const [lockerReserved, setLockerReserved] = useState(false);
  const [reserveTime, setReserveTime] = useState({});

  const dateFormat = "yyyy-MM-dd";

  // console.log(
  //   "MINDATE IN CAL: ",
  //   minDate,
  //   blackoutDates,
  //   "\ncurrent date for ALL delivery types: ",
  //   delDate,
  //   "\n current delivery type: ",
  //   deliveryType,
  //   "\ndelDate: ",
  //   delDate,
  //   "\ncart: ",
  //   JSON.stringify(cart)

  // );

  useEffect(() => {
    // * If user previously confirmed a locker reservation, reset the state if the method/pickup type is switched

    lockerReserved ? setLockerReserved(false) : null;
  }, [selectedMethod, attributes["Pickup-Location-Company"]]);

  console.log("attributes from calendar: ", attributes);

  useEffect(() => {
    setSelected(null);
    setToday(new Date());
  }, [deliveryType]);

  const getHeading = () => {
    return selectedMethod === "pickup" ? "Collection Date" : "Delivery Date";
  };

  useEffect(() => {
    let method = capitalise(selectedMethod);
    const updateAttributeDate = async () => {
      console.log(
        "CALENDAR USEEFFECT IS FIRING, selected: ",
        selected,
        "\nminDate: ",
        minDate,
        "\ndelDate: ",
        delDate,
        "\n ZIP:",
        currentShippingAddress.zip
      );

      setSelected(minDate);

      await changeAttributes({
        type: "updateAttribute",
        key: `${method}-Date`,
        value: minDate,
      });

      if (selectedMethod === "pickup") {
        await changeAttributes({
          type: "updateAttribute",
          key: `Pickup-AM-Hours`,
          value: getPickupTime(minDate, "am"),
        });
        await changeAttributes({
          type: "updateAttribute",
          key: `Pickup-PM-Hours`,
          value: getPickupTime(minDate, "pm"),
        });
      }

      // (TODO) get location opening / AM_PM hours
    };

    selected !== minDate ? updateAttributeDate() : null;
    setToday(new Date())
    // (selected && delDate !== selected) ||
    // (!selected && delDate !== minDate) ||
    // !delDate
    //   : null;
  }, [currentShippingAddress.zip]);

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

    // console.log(
    //   "forward in time: ",
    //   new Date(addDays(today, 5)),
    //   addYears(new Date(), 1),
    //   isAfter(new Date(addDays(today, 6)), addYears(new Date(), 1))
    // );
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
    // console.log("weekback: ", today, new Date(), backwardLocked);
  };
  const weekForward = () => {
    let weekAhead = new Date(format(addDays(today, 6), dateFormat).toString());

    isSameMonth(weekAhead, new Date(today))
      ? null
      : setSelectedMonth(format(weekAhead, "MMMM yyyy"));
    // console.log("going a week forward: ", weekAhead);
    forwardLocked ? null : setToday(weekAhead);
  };

  const setSelectedDate = async (date) => {
    // console.log("new date: ", date);
    setSelected(date);

    if (!lockerReserved) {
      await changeAttributes({
        type: "updateAttribute",
        key: `${capitalise(selectedMethod)}-Date`,
        value: date,
      });
    }
    if (selectedMethod === "pickup") {
      if (!lockerReserved) {
        await changeAttributes({
          type: "updateAttribute",
          key: `Pickup-AM-Hours`,
          value: getPickupTime(date, "am"),
        });
        await changeAttributes({
          type: "updateAttribute",
          key: `Pickup-PM-Hours`,
          value: getPickupTime(date, "pm"),
        });
      }
      // setPickupTimes({
      //   am: getPickupTime(date, "am"),
      //   pm: getPickupTime(date, "pm"),

      // })
    }
    if (selectedMethod !== "pickup" && deliveryType === "postal") {
      let newAttr = [
        ...cart[0].attributes,
        {
          key: "_ZapietId",
          value: `M=S&D=${new Date(date).toISOString()}`,
        },
      ];
      await setCartLineAttr({
        type: "updateCartLine",
        id: cart[0].id,
        attributes: [...newAttr],
      });
    }
  };

  const formatDeliveryType = () => {
    let x = deliveryType.split("-");
    let t = x
      .map((y) => {
        return capitalise(y);
      })
      .join(" ");
    return t;
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);

    !isThisMonth(new Date(value))
      ? setToday(new Date(value))
      : setToday(new Date());
  };

  const isDateDisabled = (date) => {
    if (
      isBefore(new Date(date), new Date(minDate)) ||
      isAfter(new Date(date), addYears(new Date(), 1))
    ) {
      return true;
    } else {
      return blackoutDates.includes(date) ||
        blackoutDates.includes(getDay(new Date(date)) + 1)
        ? true
        : false;
    }
  };

  const getPickupTime = (date, meridian) => {
    let t = format(new Date(date), "EEEE").toString().toLowerCase();
    return locationHours[`${t}_${meridian}_pickup_hours`];
  };

  return (
    <View padding={["none", "none", "base", "none"]}>
      <InlineLayout blockAlignment={"center"} columns={["auto", "fill"]}>
        <BlockStack spacing={"extraTight"}>
          <Heading level={1}>{getHeading()}</Heading>
          {selectedMethod === "pickup" ? (
            <Text size={"base"}>
              {attributes["Pickup-Location-Company"].replaceAll(/\s-\s/gm, " ")}
            </Text>
          ) : (
            <Text>
              {formatDeliveryType()} to {currentShippingAddress.zip}
            </Text>
          )}
        </BlockStack>
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
            key={i}
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
            key={i}
            inlineAlignment={"center"}
            blockAlignment={"center"}
            minBlockSize={30}
            minInlineSize={50}
            padding={["tight", "none", "none", "none"]}
            inlineSize={"fill"}
          >
            {/* <Button
        
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
            </Button> */}

            {(!selected &&
              format(new Date(addDays(today, i)), dateFormat) === minDate) ||
            (selected &&
              selected === format(new Date(addDays(today, i)), dateFormat)) ? (
              <InlineLayout
                minInlineSize={70}
                minBlockSize={50}
                maxBlockSize={50}
              >
                <Button
                  disabled={isDateDisabled(
                    format(addDays(today, i), dateFormat)
                  )}
                  onPress={() =>
                    setSelectedDate(
                      format(new Date(addDays(today, i)), dateFormat)
                    )
                  }
                >
                  <Text>{format(addDays(today, i), "d").toString()}</Text>
                </Button>
              </InlineLayout>
            ) : (
              <InlineLayout minInlineSize={`${50}%`}>
                <Pressable
                  minInlineSize={70}
                  minBlockSize={50}
                  maxBlockSize={50}
                  blockAlignment={"center"}
                  inlineAlignment={"center"}
                  disabled={isDateDisabled(
                    format(addDays(today, i), dateFormat)
                  )}
                  onPointerEnter={() => setCurrentHover(i)}
                  onPointerLeave={() => setCurrentHover(null)}
                  border={currentHover === i ? "base" : "none"}
                  borderRadius={"base"}
                  onPress={() =>
                    setSelectedDate(
                      format(new Date(addDays(today, i)), dateFormat)
                    )
                  }
                >
                  <Text>{format(addDays(today, i), "d").toString()}</Text>
                </Pressable>
              </InlineLayout>
            )}
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
              key: { i },
              value: `${format(new Date(), "MMMM yyyy")}`,
              label: `${format(new Date(), "MMMM yyyy")}`,
            };
          } else {
            return {
              key: { i },
              value: `${format(addMonths(new Date(), i), "MMMM yyyy")}`,
              label: `${format(addMonths(new Date(), i), "MMMM yyyy")}`,
            };
          }
        })}
      />
      {selectedMethod === "pickup" && attributes["Pickup-Location-Id"] && (
        <View padding={["base", "none", "tight", "none"]}>
          <TextBlock>
            On{" "}
            <Text emphasis="bold">
              {format(new Date(selected ? selected : minDate), "EEEE")}{" "}
            </Text>
            the{" "}
            <Text>
              {attributes["Pickup-Location-Type"] === "lockers"
                ? "locker"
                : "store"}{" "}
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

          {/* <OpeningHours
            locationHours={locationHours}
            locationDescription={locationDescription}
            currentDate={selected ? selected : minDate}
          /> */}
          {attributes["Pickup-Location-Type"] === "lockers" && (
            <LockerReserve
              penguinCart={penguinCart}
              lockerReserved={lockerReserved}
              setLockerReserved={setLockerReserved}
              reserveTime={reserveTime}
              setReserveTime={setReserveTime}
              dateMatch={
                reserveTime?.expiry && reserveTime.date === selected
                  ? true
                  : false
              }
              selected={selected ? selected : minDate}
              attributes={attributes}
              changeAttributes={changeAttributes}
              url={url}
              getPickupTime={getPickupTime}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default Calendar;
