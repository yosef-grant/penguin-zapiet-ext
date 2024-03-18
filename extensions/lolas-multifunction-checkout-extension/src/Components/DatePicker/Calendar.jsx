import React, { useEffect, useState } from 'react';
import { View } from '@shopify/ui-extensions-react/checkout';

import { format, isBefore, getDay, isAfter, addYears } from 'date-fns';

import { capitalise } from '../../helpers/StringFunctions.jsx';

import OpeningHours from './OpeningHours.jsx';
import LockerReserve from './LockerReserve.jsx';
import CalendarLocationInfo from './CalendarComponents/CalendarLocationInfo.jsx';
import CalendarHeader from './CalendarComponents/CalendarHeader.jsx';
import CalendarWeekSelect from './CalendarComponents/CalendarWeekSelect.jsx';
import CalendarMonthSelect from './CalendarComponents/CalendarMonthSelect.jsx';
import CalendarDateSelect from './CalendarComponents/CalendarDateSelect.jsx';

const Calendar = ({
  // methodData,
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



  const [lockerReserved, setLockerReserved] = useState(false);
  const [reserveTime, setReserveTime] = useState(null);

  const dateFormat = 'yyyy-MM-dd';

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
  }, [selectedMethod, attributes['Pickup-Location-Company']]);

  console.log('attributes from calendar: ', attributes);


  useEffect(() => {
    setSelected(null);
    setToday(new Date());
  }, [deliveryType]);

  useEffect(() => {
    let method = capitalise(selectedMethod);
    const updateAttributeDate = async () => {
      console.log(
        'CALENDAR USEEFFECT IS FIRING, selected: ',
        selected,
        '\nminDate: ',
        minDate,
        '\ndelDate: ',
        delDate,
        '\n ZIP:',
        currentShippingAddress.zip
      );

      setSelected(minDate);

      await changeAttributes({
        type: 'updateAttribute',
        key: `${method}-Date`,
        value: minDate,
      });

      if (selectedMethod === 'pickup') {
        await changeAttributes({
          type: 'updateAttribute',
          key: `Pickup-AM-Hours`,
          value: getPickupTime(minDate, 'am'),
        });
        await changeAttributes({
          type: 'updateAttribute',
          key: `Pickup-PM-Hours`,
          value: getPickupTime(minDate, 'pm'),
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
        type: 'updateAttribute',
        key: `${capitalise(selectedMethod)}-Date`,
        value: date,
      });
    }
    if (selectedMethod === 'pickup') {
      if (!lockerReserved) {
        await changeAttributes({
          type: 'updateAttribute',
          key: `Pickup-AM-Hours`,
          value: getPickupTime(date, 'am'),
        });
        await changeAttributes({
          type: 'updateAttribute',
          key: `Pickup-PM-Hours`,
          value: getPickupTime(date, 'pm'),
        });
      }
      // setPickupTimes({
      //   am: getPickupTime(date, "am"),
      //   pm: getPickupTime(date, "pm"),

      // })
    }
    if (selectedMethod !== 'pickup' && deliveryType === 'postal') {
      let newAttr = [
        ...cart[0].attributes,
        {
          key: '_ZapietId',
          value: `M=S&D=${new Date(date).toISOString()}`,
        },
      ];
      await setCartLineAttr({
        type: 'updateCartLine',
        id: cart[0].id,
        attributes: [...newAttr],
      });
    }
  };



  const getPickupTime = (date, meridian) => {
    let t = format(new Date(date), 'EEEE').toString().toLowerCase();
    console.log('from get pickup time function: ', locationHours, '\nday: ', t)
    return locationHours[`${t}_${meridian}_pickup_hours`];
  };

  return (
    <View padding={['none', 'none', 'base', 'none']}>
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

      <CalendarMonthSelect
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        setToday={setToday}
      />
      <CalendarDateSelect
        selected={selected}
        dateFormat={dateFormat}
        minDate={minDate}
        setSelectedDate={setSelectedDate}
        today={today}
        blackoutDates={blackoutDates}
      />
      {selectedMethod === 'pickup' && attributes['Pickup-Location-Id'] && (
        <View padding={['base', 'none', 'tight', 'none']}>
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
          {attributes['Pickup-Location-Type'] === 'lockers' && (
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
