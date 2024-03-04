import { Heading } from '@shopify/ui-extensions-react/checkout';
import React, { useEffect, useState } from 'react';
import Calendar from './Calendar.jsx';
import DeliveryToggle from './DeliveryToggle.jsx';
import BlockLoader from '../../../delivery-rules/src/BlockLoader.jsx';

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
  const [currentPickupLocationId, setCurrentPickupLocationId] = useState(null);
  const [penguinCart, setPenguinCart] = useState(null);

  useEffect(() => {
    const getPickupDates = async () => {
      // console.log(
      //   'getting pickup data: ',
      //   locationId,
      //   locationType,
      //   locationHandle
      // );

      !fetching ? setFetching(true) : null;

      let nextDayMeta = appMeta.map((meta) => {
        return JSON.parse(meta.metafield.value).next_day_delivery.value;
      });
      let nextDay =
        nextDayMeta.includes(1) || nextDayMeta.includes(null) ? true : false;


      console.log('IS PRODUCT NEXT DAY? ', nextDay);

      let resBody = {
        cart: cart,
        locationId: attributes['Pickup-Location-Id'],
        locationType: attributes['Pickup-Location-Type'],
        locationHandle: attributes['Pickup-Location-Company']
          .toLowerCase()
          .replaceAll(/\s?[$&+,:;=?@#|'<>.^*()%!-]/gm, '')
          .replaceAll(/\s/gm, '-'),
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

      attributes['Pickup-Location-Type'] === 'lockers'
        ? setPenguinCart(data.cartInfo)
        : attributes['Pickup-Location-Type'] !== 'lockers' && penguinCart
        ? setPenguinCart(null)
        : null;


      setLocationDescription(data.description);
      setLocationHours(data.hours);
      setBlackoutDates(data.blackout_dates);
      setMinDate(data.minDate);

      setCurrentPickupLocationId(attributes['Pickup-Location-Id']);
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
        let t = [
          ...cart[0].attributes,
          {
            key: '_ZapietId',
            value: `M=S&D=${new Date(delData.shipping.min_date).toISOString()}`,
          },
        ];
        await setCartLineAttr({
          type: 'updateCartLine',
          id: cart[0].id,
          attributes: [...t],
        });

        console.log('HERES THE CART FROM DATEPICKER: ', JSON.stringify(cart));

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

    console.log(
      'from DATESELECT - current pickup id in state: ',
      currentPickupLocationId,
      '\ncurrent location Id in attributes: ',
      attributes['Pickup-Location-Id']
    );
    // setFetching(true);
    if (
      selectedMethod === 'pickup' &&
      attributes['Pickup-Location-Id'] &&
      currentPickupLocationId !== attributes['Pickup-Location-Id']
    ) {
      console.log(
        `getting PICKUP DATA for ${attributes['Pickup-Location-Company']}`
      );
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
  }, [
    // selectedMethod,
    currentShippingAddress.zip,
    attributes['Pickup-Location-Id'],
  ]);
  return (
    <>
      {fetching ? (
        <BlockLoader
          message={
            selectedMethod === 'pickup'
              ? 'Getting location dates...'
              : 'Getting delivery dates...'
          }
        />
      ) : (
        // {fetching && !minDate ? (
        //   <BlockLoader message={"Getting location dates..."}/>
        // ) : (
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
          {((selectedMethod !== 'pickup' && deliveryType) ||
            (selectedMethod === 'pickup' &&
              attributes['Pickup-Location-Company'] &&
              locationHours)) && (
            <Calendar
              minDate={minDate}
              blackoutDates={blackoutDates}
              locationHours={locationHours}
              locationDescription={locationDescription}
              selectedMethod={selectedMethod}
              changeAttributes={changeAttributes}
              delDate={delDate}
              deliveryType={deliveryType}
              attributes={attributes}
              currentShippingAddress={currentShippingAddress}
              setCartLineAttr={setCartLineAttr}
              cart={cart}
              penguinCart={penguinCart}
              appUrl={appUrl}
            />
          )}
        </>
      )}
    </>
  );
};

export default DateSelect;
