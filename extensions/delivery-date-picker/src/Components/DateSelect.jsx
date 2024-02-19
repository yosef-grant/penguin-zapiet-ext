import { Heading } from '@shopify/ui-extensions-react/checkout';
import React, { useEffect, useState } from 'react';
import Calendar from './Calendar.jsx';
import DeliveryToggle from './DeliveryToggle.jsx';

const DateSelect = ({
  selectedMethod,
  locationId,
  locationType,
  locationHandle,
  appMeta,
  cart,
  appUrl,
  changeAttributes,
  delDate,
  currentShippingAddress,
  setCartLineAttr,
  attributes,
  availableMethods,
}) => {
  const [fetching, setFetching] = useState(true);
  const [minDate, setMinDate] = useState(null);
  const [blackoutDates, setBlackoutDates] = useState(null);
  const [locationHours, setLocationHours] = useState(null);
  const [locationDescription, setLocationDescription] = useState(null);
  const [deliveryType, setDeliveryType] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [currentDeliveryPostcode, setCurrentDeliveryPostcode] = useState(null);
  const [currentPickupPostcode, setCurrentPickupPostcode] = useState(null);

  useEffect(() => {
    const getPickupDates = async () => {
      console.log(
        'getting pickup data: ',
        locationId,
        locationType,
        locationHandle
      );
      let nextDayMeta = appMeta.map((meta) => {
        return JSON.parse(meta.metafield.value).next_day_delivery.value;
      });
      let nextDay =
        nextDayMeta.includes(1) || nextDayMeta.includes(null) ? true : false;

      // let selectedLocation = checkoutData.pickup.qCollectLocations.filter(location => {
      //   return location.postal_code === currentShippingAddress.zip
      // })

      console.log('IS PRODUCT NEXT DAY? ', nextDay);

      let resBody = {
        cart: cart,
        locationId: locationId,
        locationType: locationType,
        locationHandle: locationHandle,
        twoDayDelivery: nextDay,
      };
      let res = await fetch(`${appUrl}/pza/pickup-dates-test`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(resBody),
      });
      let data = await res.json();
      console.log('dates for pickup location!', data, '\n', resBody);

      // let minDay = format(
      //   getDay(new Date(data.minDate)) + 1,
      //   'EEEE'
      // ).toLowerCase();

      // let x = {
      //   id: store.location.id,
      //   is_locker:
      //     store.location.custom_attribute_1 === "lockers" ? true : false,
      //   store_hours: store.hours,
      // };
      // setPickupLocationInfo(x);
      // setMethodData(data);

      setLocationDescription(data.description);
      setLocationHours(data.hours);
      setBlackoutDates(data.blackout_dates);
      setMinDate(data.minDate);

      setCurrentPickupPostcode(currentShippingAddress.zip);
      console.log('new min date: ', minDate);
      setFetching(false);
    };

    const getDeliveryDates = async () => {
      // if (currentShippingAddress.zip !== currentDeliveryPostcode) {
      //   console.log(
      //     'POSTCODE MISMATCHED - GATHERING NEW DATA: ',
      //     '\npostcode from shipping address: ',
      //     currentShippingAddress.zip,
      //     '\npostcode from state: ',
      //     currentDeliveryPostcode
      //   );

      if (
        !deliveryData ||
        currentShippingAddress.zip !== currentDeliveryPostcode
      ) {
        let nextDayMeta = appMeta.map((meta) => {
          return JSON.parse(meta.metafield.value).next_day_delivery.value;
        });
        let nextDay =
          nextDayMeta.includes(1) || nextDayMeta.includes(null) ? true : false;

        let checkBody = {
          type: 'delivery',
          postcode: currentShippingAddress.zip,
          cart: cart,
          twoDayDelivery: nextDay,
        };

        let checkRes = await fetch(`${appUrl}/pza/check-postcode-test`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(checkBody),
        });
        let delData = await checkRes.json();

        console.log(
          'Postcode availability data from date select: ',
          delData,
          cart[0].attributes[0].value,
          'current postcode: ',
          currentShippingAddress.zip
        );

        setDeliveryData(delData);
        if (
          attributes['Checkout-Method'] === 'delivery' &&
          delData.delivery.delivery_zone !== 'unavailable'
        ) {
          setBlackoutDates(delData.delivery.blackouts);
          setMinDate(delData.delivery.min_date);
        } else if (
          attributes['Checkout-Method'] === 'delivery' &&
          delData.delivery.delivery_zone === 'unavailable'
        ) {
          setBlackoutDates(delData.shipping.blackouts);
          setMinDate(delData.shipping.min_date);
        } else if (attributes['Checkout-Method'] === 'shipping') {
          setBlackoutDates(delData.shipping.blackouts);
          setMinDate(delData.shipping.min_date);
        }

        setDeliveryType(
          delData.delivery.delivery_zone === 'unavailable'
            ? 'postal'
            : 'driver-delivery'
        );
      }

      // if (deliveryData) {
      //   console.log('delivery data present & delivery service switched!');
      //   setMinDate(deliveryData[selectedMethod].min_date);
      //   setBlackoutDates(deliveryData[selectedMethod].blackouts);
      // }
      else {
        setDeliveryType(
          attributes['Checkout-Method'] === 'delivery'
            ? 'driver-delivery'
            : 'postal'
        );
      }

      setFetching(false);
      // }
      setCurrentDeliveryPostcode(currentShippingAddress.zip);
    };

    if (
      selectedMethod === 'pickup' &&
      currentShippingAddress.zip !== currentPickupPostcode
    ) {
      console.log(`getting PICKUP DATA for ${locationHandle}`);
      getPickupDates();
    } else if (selectedMethod !== 'pickup' && currentShippingAddress.zip) {
      console.log(
        'refreshing DELIVERY DATA: ',
        selectedMethod,
        '\n postcode in state: ',
        currentDeliveryPostcode,
        '\npostcode in shopify: ',
        currentShippingAddress.zip
      );
      getDeliveryDates();
    }
  }, [selectedMethod, currentShippingAddress.zip]);
  return (
    <>
      {fetching && !minDate ? (
        <Heading>Fetching</Heading>
      ) : (
        <>
          {selectedMethod !== 'pickup' && deliveryData && (
            <DeliveryToggle
              deliveryType={deliveryType}
              setDeliveryType={setDeliveryType}
              setCartLineAttr={setCartLineAttr}
              deliveryData={deliveryData}
              availableMethods={availableMethods}
              cart={cart}
              setBlackoutDates={setBlackoutDates}
              changeAttributes={changeAttributes}
              attributes={attributes}
              setMinDate={setMinDate}
            />
          )}
          <Calendar
            minDate={minDate}
            blackoutDates={blackoutDates}
            locationHours={locationHours}
            locationDescription={locationDescription}
            selectedMethod={selectedMethod}
            changeAttributes={changeAttributes}
            delDate={delDate}
            deliveryType={deliveryType}
          />
        </>
      )}
    </>
  );
};

export default DateSelect;
