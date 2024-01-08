import {
  Grid,
  View,
  Button,
  Tooltip,
  Heading,
  Pressable,
  Image,
  Spinner,
} from '@shopify/ui-extensions/checkout';
import { useEffect, useState } from 'react';

import {
  InlineStack,
  Text,
  useApplyAttributeChange,
  useApplyCartLinesChange,
  useAttributeValues,
  useAttributes,
  useCartLines,
  useShippingAddress,
  useStorage,
} from '@shopify/ui-extensions-react/checkout';

import LocationsSelect from './LocationsSelect.jsx';
import CancelBtn from './CancelBtn.jsx';
import CSPortal from './CSPortal.jsx';
import Calendar from './Calendar.jsx';

const CheckoutMethodSelect = ({
  availableMethods,
  postcode,
  setPostcode,
  cart,
  nextDay,
  url,
  setAddress,
  checkoutData,
  selectedMethod,
  setSelectedMethod,
  resetMS,
  setCollectLocations,
  setMinDate,
  setPenguinCart,
  collectLocation,
  setCollectLocation,
  setDisplayCalendar,
  penguinCart,
  lockerReserved,
  setLockerReserved,
  cs,
  setCS,
  globalLoad,
  displayCalendar,
  selectLocation,
  confirmLocation,
  selectDates,
  penguinDelete,
}) => {
  const icons = {
    delivery: {
      disabled:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/delivery_disabled.svg?v=1702292364',
      default:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/delivery_default.svg?v=1702292364',
      hover:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/delivery_hover.svg?v=1702292364',
      selected:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/delivery_selected.svg?v=1702292364',
    },
    pickup: {
      disabled:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/collection_disabled.svg?v=1702292364',
      default:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/collection_default.svg?v=1702292364',
      hover:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/collection_hover.svg?v=1702292364',
      selected:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/collection_selected.svg?v=1702292364',
    },
    shipping: {
      disabled:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/shipping_unavailable.svg?v=1702292364',
      default:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/shipping_default.svg?v=1702292364',
      hover:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/shipping_hover.svg?v=1702292364',
      selected:
        'https://cdn.shopify.com/s/files/1/0503/8954/9250/files/shipping_selected.svg?v=1702292364',
    },
  };

  /*
  TODO Implement reserve timer state for the method-select component (mirror quick collect)
  */

  const [hover, setHover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState('');
  const [reserveTime, setReserveTime] = useState({});
  const attributes = useAttributes();

  useEffect(() => {
    console.log('@@@@@@@@@ ', availableMethods);
  }, [availableMethods]);

  const shippingAddress = useShippingAddress();
  let changeAttributes = useApplyAttributeChange();

  const storage = useStorage();

  let savedPath = useAttributeValues(['buyer-pathway']);

  useEffect(() => {
    savedPath[0] === 'quick-collect'
      ? setDisabled(true)
      : !savedPath[0] && disabled
      ? setDisabled(false)
      : null;
  }, [attributes]);

  useEffect(() => {
    const checkStorage = async () => {
      let s = await storage.read('pathway');
      console.log('*************from method select: ', s);
    };
    checkStorage();
  }, [storage]);

  const attr = useAttributes();
  const attrList = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  // useEffect(() => {
  //   console.log("current postcode: ", postcode, shippingAddress);
  //   postcode && shippingAddress.zip === postcode ? null : setPostcode(null);
  // }, [shippingAddress]);

  const checkCS = async (value) => {
    const res = await fetch(`${url}/pza/check-pw`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        pw: value,
      }),
    });
    let z = await res.json();

    console.log(';;;;;;;;;;;;;;;;;;;;;', z);
    return z.status;
  };

  const checkPostcode = async () => {
    if (shippingAddress.zip) {
      setLoading(true);
      await changeAttributes({
        type: 'updateAttribute',
        key: 'buyer-pathway',
        value: 'method-select',
      });
      await storage.write('pathway', 'method-select');
      console.log(shippingAddress.zip);

      if (shippingAddress.zip.length === 12) {
        let status = await checkCS(shippingAddress.zip);
        if (status === true) {
          setCS((cs) => {
            return { ...cs, status: true };
          });
          await setAddress({
            type: 'updateShippingAddress',
            address: { zip: '' },
          });
        }
        setLoading(false);
      } else {
        let postcodeRes = await fetch(
          `https://api.postcodes.io/postcodes/${shippingAddress.zip}`,
          {
            method: 'GET',
          }
        );

        let postcodeData = await postcodeRes.json();

        console.log(postcodeData.result);

        if (postcodeData?.result) {
          console.log('valid postcode!');

          let checkBody = {
            methods: availableMethods,
            postcode: postcodeData.result.postcode,
            cart: cart,
            twoDayDelivery: nextDay,
          };

          console.log('::::ND ', nextDay);

          let checkRes = await fetch(`${url}/pza/check-postcode-test`, {
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(checkBody),
          });
          let pcCheckData = await checkRes.json();

          console.log(
            'postcode results: ',
            postcodeData,
            '\n Postcode availability data: ',
            pcCheckData
          );

          await setAddress({
            type: 'updateShippingAddress',
            address: { zip: postcodeData.result.postcode },
          });

          setCollectLocations({
            delivery: pcCheckData.delivery,
            shipping: pcCheckData.shipping,
            pickup_locations: pcCheckData.pickup.locations,
          });
          setPostcode(shippingAddress.zip);
          setLoading(false);
        }
      }
    } else {
      setError('Enter a valid postcode')
    }
  };

  const checkNullDelivery = (data) => {
    return (data === 'delivery' &&
      checkoutData.delivery.delivery_zone.trim().toLowerCase() ===
        'unavailable') ||
      !availableMethods[data]
      ? true
      : false;
  };

  const getKeyname = (raw) => {
    let x;
    switch (raw) {
      case 'delivery':
        x = 'Postal';
        break;
      case 'pickup':
        x = 'Collection';
        break;
      case 'shipping':
        x = 'Delivery';
        break;
    }
    return x;
  };

  const capitalise = (str) => {
    const first = str.charAt(0).toUpperCase();
    const r = str.slice(1, str.length);
    return `${first}${r}`;
  };

  const handleMethodSelect = async (method) => {
    if (method !== selectedMethod) {
      console.log('heres data from method select: ', checkoutData);
      reserveTime?.expiry ? setReserveTime({}) : null;

      setSelectedMethod(method);
      setDisplayCalendar(false);
      method !== 'pickup' ? setSelectedMethod(method) : null;
      method !== 'pickup' ? setMinDate(checkoutData[method].min_date) : null;
      Object.keys(attrList).forEach(async (key) => {
        console.log('UUU ', key);

        await changeAttributes({
          type: 'updateAttribute',
          key: 'Checkout-Method',
          value: method,
        });
        if (
          key !== 'Lolas-CS-Member' &&
          key !== 'Customer-Service-Note' &&
          key !== 'buyer-pathway' &&
          key !== 'Checkout-Method'
        ) {
          // TODO strange behaviour when coming from pickup --> delivery; PM time remains in attr

          await changeAttributes({
            type: 'updateAttribute',
            key: key,
            value: '',
          });
        }
        if (method !== 'pickup') {
          await changeAttributes({
            type: 'updateAttribute',
            key: `${capitalise(method)}-Date`,
            value: checkoutData[method].min_date,
          });
        }
      });
    }
  };

  const handleReset = async () => {
    setPostcode(null);
    setSelectedMethod(null);
    setReserveTime({});
    resetMS();
    penguinDelete();
    displayCalendar ? setDisplayCalendar(false) : null;
    await changeAttributes({
      type: 'updateAttribute',
      key: 'buyer-pathway',
      value: '',
    });
  };

  return globalLoad ? (
    <View blockAlignment="center" inlineAlignment={'center'}>
      <Spinner size="large" accessibilityLabel="Getting pickup locations" />
    </View>
  ) : (
    <>
      {!!cs.status && (
        <CSPortal
          setCS={setCS}
          cs={cs}
          allLocations={checkoutData.pickup.qCollectLocations}
        />
      )}
      {postcode ? (
        <View position={'relative'}>
          <Heading level={2}>
            Choose Hand Delivery, Collection or Nationwide Postal
          </Heading>
          <CancelBtn handler={handleReset} />

          <Grid
            columns={['fill', 'fill', 'fill']}
            rows={['auto']}
            spacing="loose"
            padding={['base', 'none', 'base', 'none']}
          >
            {Object.keys(availableMethods).map((key, i) => (
              <Pressable
                key={`${key}${i}`}
                disabled={checkNullDelivery(key)}
                onPress={() => handleMethodSelect(key)}
                onPointerEnter={() => setHover(key)}
                onPointerLeave={() => setHover(null)}
              >
                <Image
                  source={
                    checkNullDelivery(key)
                      ? icons[key].disabled
                      : selectedMethod === key
                      ? icons[key].selected
                      : hover === key
                      ? icons[key].hover
                      : icons[key].default
                  }
                />
              </Pressable>
            ))}
          </Grid>
        </View>
      ) : (
        <View minInlineSize="fill" opacity={disabled ? 50 : 100}>
          <Grid>
            <Button
              disabled={disabled ? true : false}
              onPress={() => checkPostcode()}
              loading={loading}
            >
              Choose Delivery Method
            </Button>
          </Grid>
          {error && <Text appearance="critical">{error}</Text>}
        </View>
      )}
      {!!selectedMethod && selectedMethod === 'pickup' && !displayCalendar && (
        <LocationsSelect
          locations={checkoutData.pickup.collectLocations}
          checkoutData={checkoutData}
          setMinDate={setMinDate}
          nextDay={nextDay}
          cart={cart}
          setPenguinCart={setPenguinCart}
          url={url}
          collectLocation={collectLocation}
          setCollectLocation={setCollectLocation}
          setSelectedMethod={setSelectedMethod}
          setDisplayCalendar={setDisplayCalendar}
          pathway={'method-select'}
          selectLocation={selectLocation}
          confirmLocation={confirmLocation}
        />
      )}
      {((!!selectedMethod && selectedMethod !== 'pickup') ||
        (!!selectedMethod &&
          selectedMethod === 'pickup' &&
          !!displayCalendar)) && (
        <Calendar
          minDate={
            selectedMethod !== 'pickup'
              ? checkoutData[selectedMethod].min_date
              : checkoutData.pickup.selectedLocation.dates.date
          }
          checkoutData={checkoutData}
          penguinCart={penguinCart}
          lockerReserved={lockerReserved}
          setLockerReserved={setLockerReserved}
          url={url}
          selectedMethod={selectedMethod}
          reserveTime={reserveTime}
          setReserveTime={setReserveTime}
          selectDates={selectDates}
        />
      )}
    </>
  );
};

export default CheckoutMethodSelect;
