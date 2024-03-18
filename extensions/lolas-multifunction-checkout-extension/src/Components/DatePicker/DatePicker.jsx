import {
  useAttributes,
  useAttributeValues,
  View,
  useCartLines,
  useApplyAttributeChange,
  useShippingAddress,
  useApplyCartLinesChange,
  useAppMetafields,
} from '@shopify/ui-extensions-react/checkout';
import React, { useEffect, useState } from 'react';

import DatePickerBody from './DatePickerBody.jsx';

import { capitalise } from '../../helpers/StringFunctions.jsx';
import CustomerNotes from './CustomerNotes.jsx';

const DatePicker = ({ url }) => {
  const selectedMethod = useAttributeValues(['Checkout-Method'])[0];
  const changeAttributes = useApplyAttributeChange();

  const [locationId, setLocationId] = useState(null);
  const [locationType, setLocationType] = useState(null);
  const [locationHandle, setLocationHandle] = useState(null);
  const [availableMethods, setAvailableMethods] = useState(null);

  const attr = useAttributes();

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  const delDate = attributes[`${capitalise(selectedMethod)}-Date`];

  let appMeta = useAppMetafields();

  console.log('App meta from DATEPICKER parent: ', appMeta);
  const cart = useCartLines();

  const currentShippingAddress = useShippingAddress();

  const setCartLineAttr = useApplyCartLinesChange();

  // * Provide DELIVERY Availability to DatePicker
  useEffect(() => {
    const types = ['pickup', 'shipping', 'delivery'];

    const x = cart[0].attributes
      .filter((attribute) => attribute.key === '_available_methods')
      .map((filteredAttr) => {
        return filteredAttr.value;
      })[0]
      .split(',')
      .reduce((acc, type) => {
        acc[type] = types.includes(type) ? true : false;
        return acc;
      }, {});
    setAvailableMethods(x);
  }, []);

  useEffect(() => {
    const handleSwitchToPickup = () => {
      setLocationId(attributes['Pickup-Location-Id']);
      setLocationType(attributes['Pickup-Location-Type']);
      setLocationHandle(
        attributes['Pickup-Location-Company']
          .toLowerCase()
          .replaceAll(/\s?[$&+,:;=?@#|'<>.^*()%!-]/gm, '')
          .replaceAll(/\s/gm, '-')
      );
    };

    attributes['Pickup-Location-Id'] ? handleSwitchToPickup() : null;
  }, [attributes['Pickup-Location-Id']]);

  return (
    <View>
      <>
        <CustomerNotes
          changeAttributes={changeAttributes}
          selectedMethod={selectedMethod}
          giftNote={attributes['Gift-Note']}
        />
        {appMeta.length && (
          <DatePickerBody
            selectedMethod={selectedMethod}
            locationId={locationId}
            locationType={locationType}
            locationHandle={locationHandle}
            cart={cart}
            url={url}
            changeAttributes={changeAttributes}
            delDate={delDate}
            currentShippingAddress={currentShippingAddress}
            setCartLineAttr={setCartLineAttr}
            attributes={attributes}
            availableMethods={availableMethods}
            appMeta={appMeta}
          />
        )}
      </>
    </View>
  );
};

export default DatePicker;
