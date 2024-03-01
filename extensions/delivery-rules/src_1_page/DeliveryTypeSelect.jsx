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

const DeliveryTypeSelect = ({
  setDeliveryType,
  deliveryType,
  setCartLineAttr,
  deliveryZone,
  methodData,
  availableMethods,
  cart,
  setBlackoutDates,
  changeAttributes,
  attributes,
}) => {
  console.log('rendered del type select: ', methodData, availableMethods);

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
                  methodData.delivery.delivery_zone !== 'unavailable'
                    ? '%' +
                      methodData.delivery.delivery_zone.replace(/[^0-9.]/g, '')
                    : ''
                }`
              : 'S';
          setBlackoutDates(
            val === 'driver-delivery'
              ? methodData.delivery.blackouts
              : methodData.shipping.blackouts
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
        }}
      >
        <InlineLayout spacing={'base'}>
          <ToggleButton
            id="driver-delivery"
            disabled={deliveryZone === 'unavailable' ? true : false}
          >
            <View
              inlineAlignment="center"
              blockAlignment="center"
              minBlockSize="fill"
            >
              <Text emphasis={deliveryType === 'driver-delivery' ? 'bold' : ''}>
                {deliveryZone === 'unavailable'
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
