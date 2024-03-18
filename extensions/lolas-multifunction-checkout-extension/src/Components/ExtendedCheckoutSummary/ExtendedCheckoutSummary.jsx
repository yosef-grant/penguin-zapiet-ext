import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  useAttributes,
  View,
  Heading,
  Divider,
  Text,
  useDeliveryGroups,
  useApplyAttributeChange,
  useStorage,
  useCartLines,
  useShippingAddress,
  useNote,
  BlockLayout,
  BlockSpacer,
  Spinner,
} from '@shopify/ui-extensions-react/checkout';
import { useState } from 'react';
import { useEffect } from 'react';

import currency from '../../helpers/Currency.jsx';
import { capitalise } from '../../helpers/StringFunctions.jsx';
import { addDays, format, isSameDay, nextDay } from 'date-fns';
import { BlockStack, InlineLayout } from '@shopify/ui-extensions/checkout';

function ExtendedCheckoutSummary() {
  const dateFormat = 'do MMM yyyy';
  const delGroups = useDeliveryGroups();
  const changeAttributes = useApplyAttributeChange();

  const cartAddress = useShippingAddress();

  const currentNote = useNote();

  const lineItems = useCartLines();

  const attr = useAttributes();

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [noneDelPrice, setNoneDelPrice] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log(
      'delivery groups have changed - use effect should update attributes'
    );
    const setDeliveryAttributes = async () => {
      let rates = delGroups[0].deliveryOptions;
      let currentRateHandle = delGroups[0].selectedDeliveryOption.handle;

      let selectedDeliveryOption = rates.filter(
        (rate) => rate.handle === currentRateHandle
      );

      let price = selectedDeliveryOption[0].costAfterDiscounts.amount * 100;

      console.log('delivery price: ', price);

      if (attributes['Checkout-Method'] === 'delivery') {
        let title = selectedDeliveryOption[0].title;

        let titleRegex = /^\b['\w\s]+\b/;
        let truncTitle = selectedDeliveryOption[0].title.match(titleRegex)[0];

        let timeRegex = new RegExp(/-\s(.*)\s\(/g);

        const time = timeRegex.exec(title)[1];

        if (
          attributes['Delivery-Time'] &&
          attributes['Delivery-Time'] === time
        ) {
          return;
        } else {
          await changeAttributes({
            type: 'updateAttribute',
            key: 'Delivery-Time',
            value: time,
          });
          await changeAttributes({
            type: 'updateAttribute',
            key: 'Delivery-Price',
            value: `${price}`,
          });
          await changeAttributes({
            type: 'updateAttribute',
            key: 'Delivery-Title',
            value: truncTitle,
          });
        }
      } else {
        // console.log("setting price attribute for pickup: ");
        // await changeAttributes({
        //   type: "updateAttribute",
        //   key: "Pickup-Price",
        //   value: price,
        // });
        // console.log('after pickup addition: ', attributes)
        console.log('none-delivery selected. rate price is: ', price);
        setNoneDelPrice(price);
      }
    };
    delGroups.length
      ? //&& attributes["Checkout-Method"] === "delivery"
        (console.log('delivery groups updated: ', delGroups),
        setDeliveryAttributes())
      : null;
  }, [delGroups]);

  useEffect(() => {
    console.log('none delivery option selected. price is: ', noneDelPrice);
  }, [noneDelPrice]);

  useEffect(() => {
    const initialiseSummary = async () => {
      if (cartAddress.zip && cartAddress.address1 && cartAddress.city) {
        let method =
          attributes['Checkout-Method'] === 'pickup'
            ? 'Collection'
            : attributes['Checkout-Method'] === 'shipping'
            ? 'Postal'
            : 'Delivery';

        let selected_day_opening_time = null;

        setCheckoutDetails({
          method: method,
          address: `${cartAddress.company ? `${cartAddress.company},` : ''}
          ${cartAddress.address1}, ${cartAddress.city}, ${cartAddress.zip}`,
        });
        // setCheckoutDetails({
        //   method: method,
        //   address: `
        //   ${
        //     attributes["Checkout-Method"] === "pickup"
        //       ? attributes["Pickup-Location-Company"] + ", "
        //       : ""
        //   }
        //   ${cartAddress.address1}, ${cartAddress.city}, ${cartAddress.zip}`,
        // });
      } else {
        checkoutDetails ? setCheckoutDetails(null) : null;
      }
    };

    initialiseSummary();
  }, [cartAddress, attributes['Checkout-Method']]);

  // attributes['Checkout-Method'] === 'pickup' &&
  //   (useEffect(() => {
  //     //let timer = setTimeout(() => setRefreshing(true), 1500);
  //     setRefreshing(true);
  //     // let timer = setTimeout(() => setRefreshing(false), 1200);
  //     // return () => {
  //     //   clearTimeout(timer);
  //     // };
  //   }, [attributes['Pickup-Date']]),
  //   useEffect(() => {
  //     console.log('PM HOURS CHANGED, current state of refresh: ', refreshing);
  //     setRefreshing(false);
  //   }, [attributes['Pickup-PM-Hours']]));
  // // console.log("attributes: ", attributes);

  const isNextDay = () => {
    let check = isSameDay(
      new Date(attributes['Pickup-Date']),
      addDays(new Date(), 1)
    );

    console.log('is this a next day pickup? ', check);
    return check;
  };

  return (
    <View>
      {Object.keys(attributes).map((key) => (
        <Heading>
          {key}: {attributes[key]}
        </Heading>
      ))}

      {(checkoutDetails?.method || attributes['Gift-Note']) && (
        <>
          <Divider />
          <View padding={['base', 'none', 'base', 'none']}>
            {(attributes['Gift-Note'] || currentNote) && (
              <>
                <InlineLayout
                  blockAlignment={'center'}
                  columns={['fill', 'fill']}
                >
                  {attributes['Gift-Note'] && (
                    <BlockLayout
                      spacing={'extraTight'}
                      blockAlignment={'start'}
                      inlineAlignment={'start'}
                      rows={['auto', 'fill']}
                    >
                      <Text emphasis="bold">Gift Note:</Text>
                      <Text>{attributes['Gift-Note']}</Text>
                    </BlockLayout>
                  )}
                  {currentNote && (
                    <BlockLayout
                      spacing={'extraTight'}
                      inlineAlignment={'end'}
                      blockAlignment={'start'}
                      rows={['auto', 'fill']}
                    >
                      <Text emphasis="bold">Safe Place:</Text>
                      <Text>{currentNote}</Text>
                    </BlockLayout>
                  )}
                </InlineLayout>
                <BlockSpacer />
              </>
            )}
            {checkoutDetails?.method && attributes['Checkout-Method'] && (
              <InlineLayout
                blockAlignment={'start'}
                columns={[`${45}%`, 'fill']}
              >
                <BlockLayout
                  spacing={'extraTight'}
                  blockAlignment={'start'}
                  inlineAlignment={'start'}
                  rows={['auto', 'fill']}
                >
                  <Text emphasis="bold">{checkoutDetails.method} Address</Text>
                  <Text>{checkoutDetails.address}</Text>
                </BlockLayout>
                {attributes[
                  `${capitalise(attributes['Checkout-Method'])}-Date`
                ] && (
                  // {`${
                  //   attributes[capitalise(attributes["Checkout-Method"])]
                  // }-Date` !== '' && (
                  <>
                    <BlockLayout
                      spacing={'extraTight'}
                      inlineAlignment={'end'}
                      maxInlineSize={'fill'}
                      rows={['auto', 'auto']}
                      minBlockSize={'fill'}
                    >
                      <Text emphasis="bold">
                        {checkoutDetails.method} Details
                      </Text>
                      {!!refreshing ? (
                        <View
                          minInlineSize={`${50}%`}
                          inlineAlignment={'center'}
                          blockAlignment={'start'}
                        >
                          <Spinner appearance="monochrome" />
                        </View>
                      ) : (
                        <>
                          <BlockStack spacing="none" inlineAlignment={'end'}>
                            <Text>
                              {format(
                                new Date(
                                  attributes[
                                    `${capitalise(
                                      attributes['Checkout-Method']
                                    )}-Date`
                                  ]
                                ),
                                dateFormat
                              )}
                            </Text>
                            {attributes['Checkout-Method'] === 'pickup' &&
                            attributes['Pickup-AM-Hours'] &&
                            attributes['Pickup-PM-Hours']
                              ? // if date === nextDay, from PM pickup else from AM pickup
                                `From ${
                                  isNextDay()
                                    ? attributes['Pickup-PM-Hours']
                                    : attributes['Pickup-AM-Hours']
                                }`
                              : attributes['Checkout-Method'] === 'delivery'
                              ? attributes['Delivery-Time']
                              : null}
                          </BlockStack>
                        </>
                      )}
                    </BlockLayout>
                  </>
                )}
              </InlineLayout>
            )}
          </View>

          <Divider />
        </>
      )}
    </View>
  );
}

export default ExtendedCheckoutSummary;
