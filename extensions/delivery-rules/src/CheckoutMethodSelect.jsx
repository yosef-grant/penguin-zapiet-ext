import {
  Grid,
  View,
  Button,
  Tooltip,
  Heading,
  Pressable,
  Image,
} from '@shopify/ui-extensions/checkout';
import { useEffect, useState } from 'react';

import {
  useApplyAttributeChange,
  useAttributes,
  useShippingAddress,
} from '@shopify/ui-extensions-react/checkout';
import LocationsSelect from './LocationsSelect.jsx';

const CheckoutMethodSelect = ({
  availableMethods,
  postcode,
  setPostcode,
  cart,
  nextDay,
  url,
  setAddress,
  methodData,
  setMethodData,
  selectedMethod,
  setSelectedMethod,
  setCheckoutData,
  setMinDate,
  setPenguinCart,
  collectLocation,
  setCollectLocation,
}) => {
  const icons = {
    delivery: {
      disabled:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034881/assets/postal_unavailable_q6eak9.svg',
      default:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034880/assets/postal_default_kviznc.svg',
      hover:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034880/assets/postal_hover_eh3a2p.svg',
      selected:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034881/assets/postal_selected_nnd6aa.svg',
    },
    pickup: {
      disabled:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034782/assets/collection_unavailable_ihpffl.svg',
      default:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034782/assets/collection_default_p4e2yp.svg',
      hover:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034782/assets/collection_hover_azgylr.svg',
      selected:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034783/assets/collection_selected_jmkqyn.svg',
    },
    shipping: {
      disabled:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034372/assets/delivery_unavailable_qc4wou.svg',
      default:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034661/assets/delivery_default_f2olig.svg',
      hover:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034660/assets/delivery_hover_w2chpc.svg',
      selected:
        'https://res.cloudinary.com/lola-s-cupcakes/image/upload/v1702034661/assets/delivery_selected_gd957e.svg',
    },
  };

  const [hover, setHover] = useState(null);

  useEffect(() => {
    console.log('@@@@@@@@@ ', availableMethods);
  }, [availableMethods]);

  const shippingAddress = useShippingAddress();
  let changeAttributes = useApplyAttributeChange();

  const attr = useAttributes();
  const attrList = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  useEffect(() => {
    console.log('current postcode: ', postcode, shippingAddress);
    postcode && shippingAddress.zip === postcode ? null : setPostcode(null);
  }, [shippingAddress]);

  const checkPostcode = async () => {
    console.log(shippingAddress.zip);
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
      setMethodData(pcCheckData);
      setPostcode(shippingAddress.zip);
    }
  };

  const checkNullDelivery = (data) => {
    return (data === 'delivery' &&
      methodData.delivery.delivery_zone.trim().toLowerCase() ===
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

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    method !== 'pickup' ? setMinDate(methodData[method].min_date) : null;
    Object.keys(attrList).forEach(async (key) => {
      console.log(key);
      if (key === 'Checkout-Method') {
        await changeAttributes({
          type: 'updateAttribute',
          key: key,
          value: method,
        });
      } else {
        await changeAttributes({
          type: 'updateAttribute',
          key: key,
          value: '',
        });
      }
    });
  };

  return (
    <>
      {postcode ? (
        <>
          <Heading>
            Choose Hand Delivery, Collection or Nationwide Postal
          </Heading>
          <Grid
            columns={['fill', 'fill', 'fill']}
            rows={['auto']}
            spacing="loose"
          >
            {Object.keys(availableMethods).map((key) => (
              <Pressable
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
        </>
      ) : (
        <View>
          <Button onPress={() => checkPostcode()}>
            Choose Delivery Method
          </Button>
        </View>
      )}
      {!!selectedMethod &&
        !!methodData &&
        (selectedMethod === 'delivery' || selectedMethod === 'shipping' ? (
          <Heading>{selectedMethod}</Heading>
        ) : (
          <>
            <Heading>Choose a store or locker for pickup</Heading>
            <LocationsSelect
              locations={methodData.pickup.locations}
              isQCollect={false}
              setCheckoutData={setCheckoutData}
              setMinDate={setMinDate}
              nextDay={nextDay}
              cart={cart}
              setPenguinCart={setPenguinCart}
              url={url}
              collectLocation={collectLocation}
              setCollectLocation={setCollectLocation}
            />
          </>
        ))}
    </>
  );
};

export default CheckoutMethodSelect;
