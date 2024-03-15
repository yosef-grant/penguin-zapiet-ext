import {
  Button,
  InlineLayout,
  Text,
  View,
  Select,
  Pressable,
  Grid,
} from "@shopify/ui-extensions-react/checkout";

import React, { useEffect, useState } from "react";

import {
  addDays,
  format,
  isBefore,
  addMonths,
  isThisMonth,
  getDay,
  isAfter,
  addYears,
} from "date-fns";

import { capitalise } from "../../helpers/StringFunctions.jsx";

import OpeningHours from "./OpeningHours.jsx";
import LockerReserve from "./LockerReserve.jsx";
import CalendarLocationInfo from "./CalendarLocationInfo.jsx";
import CalendarHeader from "./CalendarHeader.jsx";
import CalendarWeekSelect from "./CalendarWeekSelect.jsx";

const days = Array.apply(null, Array(6)).map(() => {});
const months = Array.apply(null, Array(13)).map(() => {});

const Calendar = ({
  // methodData,
  // deliveryType,
  // pickupLocationInfo,
  // changeAttributes,
  // localStorage,

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
}) => {
  const [today, setToday] = useState(new Date());

  const [selected, setSelected] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [pickupTimes, setPickupTimes] = useState(null);

  const [currentHover, setCurrentHover] = useState(null);

  const [lockerReserved, setLockerReserved] = useState(false);
  const [reserveTime, setReserveTime] = useState(null);

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
    setToday(new Date());
  }, [currentShippingAddress.zip]);

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
      <CalendarHeader
        selectedMethod={selectedMethod}
        attributes={attributes}
        currentShippingAddress={currentShippingAddress}
        selected={selected}
        minDate={minDate}
        deliveryType={deliveryType}
      />
      <CalendarWeekSelect
        today={today}
        setToday={setToday}
        dateFormat={dateFormat}
        setSelectedMonth={setSelectedMonth}
      />
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
          <CalendarLocationInfo
            selected={selected}
            minDate={minDate}
            locationHours={locationHours}
            attributes={attributes}
            getPickupTime={getPickupTime}
          />
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
