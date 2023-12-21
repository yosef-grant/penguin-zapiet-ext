import {
  BlockSpacer,
  DatePicker,
  Heading,
  Tooltip,
  View,
} from "@shopify/ui-extensions/checkout";
import {
  addYears,
  formatISO,
  getMonth,
  getYear,
  startOfYesterday,
  subDays,
  getDay,
  addDays,
} from "date-fns";
import React, { useEffect, useState } from "react";

// req format = YYYY-MM-DD; potential for issues with IOS/SAFARI
import LockerReserve from "./LockerReserve.jsx";
import format from "date-fns/format";
import {
  Button,
  Modal,
  useApplyAttributeChange,
  useApi,
  Text,
  useAttributes,
} from "@shopify/ui-extensions-react/checkout";

const dateFormat = "yyyy-MM-dd";
const Calendar = ({
  minDate,

  checkoutData,
  penguinCart,
  lockerReserved,
  setLockerReserved,
  url,
  selectedMethod,
  setReserveTime,
  setTest,
  prop,
  reserveTime,
  selectDates,
}) => {
  console.log(
    "::::: from calendar: ",
    minDate,
    format(new Date(minDate), dateFormat),
    checkoutData
  );

  const attr = useAttributes();
  const attrList = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );
  let changeAttributes = useApplyAttributeChange();

  const { ui } = useApi();
  const [selectedDate, setSelectedDate] = useState(null);
  const [lockerLoading, setLockerLoading] = useState(false);

  console.log(")))here is the selected Date: ", selectedDate);

  const handleYearMonthChange = (e, yearMonth) => {
    let currentMonth = getMonth(new Date()) - 1;

    if (yearMonth.month < currentMonth) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("year month has changed: ", yearMonth);
  };

  const getWeekday = (date) => {
    let day = getDay(new Date(date));
    let x;
    switch (day) {
      case 0:
        x = "sunday";
        break;
      case 1:
        x = "monday";
        break;
      case 2:
        x = "tuesday";
        break;
      case 3:
        x = "wednesday";
        break;
      case 4:
        x = "thursday";
        break;
      case 5:
        x = "friday";
        break;
      case 6:
        x = "saturday";
        break;
    }
    return x;
  };

  const getBlackoutDay = (day) => {
    let x;
    // -1 day to account for date FNS none-0 indexing of days vs Zapiets 0 index
    switch (day - 1) {
      case 0:
        x = "Sunday";
        break;
      case 1:
        x = "Monday";
        break;
      case 2:
        x = "Tuesday";
        break;
      case 3:
        x = "Wednesday";
        break;
      case 4:
        x = "Thursday";
        break;
      case 5:
        x = "Friday";
        break;
      case 6:
        x = "Saturday";
        break;
    }
    return x;
  };

  useEffect(() => {
    console.log("@@@ ", selectedDate);
  }, [selectedDate]);

  const handleDateSelect = async (selected) => {
    console.log(selected);

    console.log("day selected: ", getDay(new Date(selected)));

    setSelectedDate(selected);
    selectDates(selected, getWeekday(selected));

    if (attrList["Checkout-Method"] === "pickup") {
      await changeAttributes({
        type: "updateAttribute",
        key: "Pickup-Date",
        value: selected,
      });
      await changeAttributes({
        type: "updateAttribute",
        key: "Pickup-AM-Hours",
        value:
          checkoutData.pickup.selectedLocation.location_hours[
            `${getWeekday(selected)}_am_pickup_hours`
          ],
      });
      await changeAttributes({
        type: "updateAttribute",
        key: "Pickup-PM-Hours",
        value:
          checkoutData.pickup.selectedLocation.location_hours[
            `${getWeekday(selected)}_pm_pickup_hours`
          ],
      });
    } else if (attrList["Checkout-Method"] === "shipping") {
      await changeAttributes({
        type: "updateAttribute",
        key: "Shipping-Date",
        value: selected,
      });
    } else {
      await changeAttributes({
        type: "updateAttribute",
        key: "Delivery-Date",
        value: selected,
      });
    }
  };

  const handleLockerReserve = async () => {
    console.log("___---```---___ RESERVING PENGUIN LOCKER ", attrList);
    setLockerLoading(true);
    if (
      attrList["Checkout-Method"] === "pickup" &&
      attrList["Pickup-Location-Type"] === "lockers"
    ) {
      console.log("LOCKER SELECTED - CREATING ORDER");
      let orderBody = {
        station_id: attrList["Pickup-Location-Id"],
        date: attrList["Pickup-Date"],
        reserve_status: lockerReserved,
        order_id: attrList["Pickup-Penguin-Id"]
          ? attrList["Pickup-Penguin-Id"]
          : null,
        cart: penguinCart,
      };

      console.log("order body ************** ", orderBody);

      let lockerRes = await fetch(`${url}/pza/confirm-delivery`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(orderBody),
      });

      let { data } = await lockerRes.json();

      console.log("order-creation-res", data, data.lockerID);

      await changeAttributes({
        type: "updateAttribute",
        key: "Pickup-Penguin-Del-Code",
        value: data.delivery_code,
      });
      await changeAttributes({
        type: "updateAttribute",
        key: "Pickup-Penguin-Pick-Code",
        value: data.picking_code,
      });
      await changeAttributes({
        type: "updateAttribute",
        key: "Pickup-Penguin-Id",
        value: `${data.lockerID}`,
      });

      await changeAttributes({
        type: "updateAttribute",
        key: "Pickup-Penguin-Locker(s)",
        value: data.lockers,
      });
    }
    setLockerLoading(false);
    setLockerReserved(true);
    console.log("___---```---___ AFTER RESERVING PENGUIN LOCKER ", attrList);
    ui.overlay.close("reservation-confirm");
    setReserveTime({
      expiry: Date.now() + 1000 * 60 * 10,
      date: selectedDate,
    });
  };

  const getDisabledDates = () => {
    x = [
      { end: format(subDays(new Date(minDate), 1), dateFormat) },
      { start: format(addYears(new Date(), 1), dateFormat) },
    ];

    // hardcode Christmas
    x.push(`${getYear(new Date())}-12-25`);

    if (selectedMethod === "pickup") {
      let locationDates = checkoutData.pickup.selectedLocation.dates;
      locationDates.blackout_dates.forEach((date) =>
        x.push(format(new Date(date), dateFormat))
      );
      locationDates.blackout_days.forEach((day) => x.push(getBlackoutDay(day)));
    } else {
      let method = checkoutData[selectedMethod];
      method?.blackouts &&
        method.blackouts.forEach((date) =>
          typeof date === "string"
            ? x.push(format(new Date(date), dateFormat))
            : x.push(getBlackoutDay(date))
        );
      method?.disabled &&
        method.disabled.forEach((date) =>
          typeof date === "string"
            ? x.push(format(new Date(date), dateFormat))
            : x.push(getBlackoutDay(date))
        );
    }

    console.log("HERE IS X FROM THE CALENDAR DISABLED DATES: ", x);
    return x;
  };

  useEffect(() => {
    console.log("MIN DATE HERE: ", minDate);
    handleDateSelect(format(new Date(minDate), dateFormat));
  }, [minDate]);

  const getHeading = () => {
    let y = attrList["Checkout-Method"];
    let type;

    switch (y) {
      case "delivery":
        type = "Delivery";
        break;
      case "pickup":
        type = "Collection";
        break;
      case "shipping":
        type = "Postal";
        break;
    }

    return `Select ${type} Date`;
  };

  return (
    <View padding={["tight", "none", "loose", "none"]}>
      <Heading level={2}>{getHeading()}</Heading>
      <BlockSpacer spacing="loose" />
      <DatePicker
        selected={
          !selectedDate ? format(new Date(minDate), dateFormat) : selectedDate
        }
        disabled={getDisabledDates()}
        onChange={(selected) => handleDateSelect(selected)}
      />

      {attrList["Pickup-Location-Type"] === "lockers" && (
        <LockerReserve
          handleLockerReserve={handleLockerReserve}
          ui={ui}
          reserveTime={reserveTime}
          dateMatch={
            reserveTime?.expiry && reserveTime.date === selectedDate
              ? true
              : false
          }
          lockerLoading={lockerLoading}
        />
      )}
    </View>
  );
};

export default Calendar;
