import {
  Choice,
  ChoiceList,
  InlineLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  View,
} from '@shopify/ui-extensions-react/checkout';
import React from 'react';
import { capitalise } from '../helpers/StringFunctions.jsx';

const DeliveryTypeSelect = ({
  setDeliveryType,
  deliveryType,
  setCartLineAttr,
  deliveryData,
  availableMethods,
  cart,
  setBlackoutDates,
  changeAttributes,
  attributes,
  setMinDate,
}) => {
  console.log(
    'rendered del type select: ',
    deliveryType,
    deliveryData,
    availableMethods
  );

  console.log(
    'from delivery toggle: ',
    cart[0].attributes,
    '\nAvailable methods: ',
    availableMethods
  );

  return (
    <View padding={['none', 'none', 'base', 'none']}>
      <ToggleButtonGroup
        value={deliveryType}
        onChange={async (val) => {
          setDeliveryType(val);
          let method = val === 'driver-delivery' ? 'delivery' : 'shipping';
          let lineItemProp =
            val === 'driver-delivery'
              ? 'D' +
                `${
                  deliveryData.delivery.delivery_zone !== 'unavailable'
                    ? '%' +
                      deliveryData.delivery.delivery_zone.replace(
                        /[^0-9.]/g,
                        ''
                      )
                    : ''
                }`
              : 'S';
          setBlackoutDates(
            val === 'driver-delivery'
              ? deliveryData.delivery.blackouts
              : deliveryData.shipping.blackouts
          );
          setMinDate(
            val === 'driver-delivery'
              ? deliveryData.delivery.min_date
              : deliveryData.shipping.min_date
          );
          // change Checkout-Method attribute to 'Shipping'
          await setCartLineAttr({
            type: 'updateCartLine',
            id: cart[0].id,
            attributes: [
              ...cart[0].attributes,
              {
                key: '_deliveryID',
                value: lineItemProp,
              },
            ],
          });
          Object.keys(attributes).forEach(async (key) => {
            if (key === 'Checkout-Method') {
              await changeAttributes({
                type: 'updateAttribute',
                key: key,
                value: method,
              });
            } else if (
              key !== 'Gift-Note' &&
              key !== 'Customer-Service-Note' &&
              key !== 'Lolas-CS-Member'
            ) {
              await changeAttributes({
                type: 'updateAttribute',
                key: key,
                value: '',
              });
            }
          });
          await changeAttributes({
            type: 'updateAttribute',
            key: `${capitalise(method)}-Date`,
            value: deliveryData[method].min_date,
          });
        }}
      >
        <InlineLayout spacing={'base'}>
          <ToggleButton
            id="driver-delivery"
            disabled={
              deliveryData.delivery.delivery_zone === 'unavailable'
                ? true
                : false
            }
          >
            <View
              inlineAlignment="center"
              blockAlignment="center"
              minBlockSize="fill"
            >
              <Text emphasis={deliveryType === 'driver-delivery' ? 'bold' : ''}>
                {deliveryData.delivery.delivery_zone === 'unavailable'
                  ? 'Driver delivery unavailable for this address'
                  : 'Driver Delivery'}
              </Text>
            </View>
          </ToggleButton>
          <ToggleButton
            id="postal"
            disabled={availableMethods.shipping ? false : true}
          >
            <View
              inlineAlignment={'center'}
              blockAlignment="center"
              minBlockSize="fill"
            >
              <Text emphasis={deliveryType === 'postal' ? 'bold' : ''}>
                {availableMethods.shipping
                  ? 'Postal'
                  : 'Postal unavailable due to products in basket'}
              </Text>
            </View>
          </ToggleButton>
        </InlineLayout>
      </ToggleButtonGroup>
    </View>
  );
};

export default DeliveryTypeSelect;
