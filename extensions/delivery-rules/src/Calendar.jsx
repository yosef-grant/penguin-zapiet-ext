import {
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
} from "date-fns";
import React, { useState } from "react";

// req format = YYYY-MM-DD; potential for issues with IOS/SAFARI

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
  setCheckoutData,
  checkoutData,
  penguinCart,
  lockerReserved,
  setLockerReserved,
  url,
  selectedMethod,
}) => {
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

  const handleDateSelect = async (selected) => {
    console.log(selected);

    console.log("day selected: ", getDay(new Date(selected)));

    setCheckoutData((checkoutData) => {
      return {
        ...checkoutData,
        checkout_date: { date: selected, day: getWeekday(selected) },
      };
    });
    setSelectedDate(selected);

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
          checkoutData.location_hours[
            `${getWeekday(selected)}_am_pickup_hours`
          ],
      });
      await changeAttributes({
        type: "updateAttribute",
        key: "Pickup-PM-Hours",
        value:
          checkoutData.location_hours[
            `${getWeekday(selected)}_pm_pickup_hours`
          ],
      });
    }
  };

  const handleLockerReserve = async () => {
    console.log("___---```---___ RESERVING PENGUIN LOCKER ", attrList);

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

      setLockerReserved(true);
    }

    console.log("___---```---___ AFTER RESERVING PENGUIN LOCKER ", attrList);
    ui.overlay.close("reservation-confirm");
  };

  return (
    <View>
      <Heading>Select Delivery Date</Heading>
      <DatePicker
        selected={
          !selectedDate ? format(new Date(minDate), dateFormat) : selectedDate
        }
        disabled={[
          { end: format(subDays(new Date(minDate), 1), dateFormat) },
          { start: format(addYears(new Date(), 1), dateFormat) },
        ]}
        onChange={(selected) => handleDateSelect(selected)}
      />

      {attrList["Pickup-Location-Type"] === "lockers" && (
        <Button
          overlay={
            <Modal id="reservation-confirm" padding={true}>
              <Heading>Confirm Reservation</Heading>
              <Text>Do you wish to confirm your locker reservation?</Text>
              <Button onPress={() => ui.overlay.close("reservation-confirm")}>
                Cancel
              </Button>
              <Button onPress={() => handleLockerReserve()}>Confirm</Button>
            </Modal>
          }
        >
          Reserve Locker
        </Button>
      )}
    </View>
  );
};

export default Calendar;
