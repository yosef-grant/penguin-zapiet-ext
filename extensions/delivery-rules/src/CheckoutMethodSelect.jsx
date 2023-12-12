import {
  Grid,
  View,
  Button,
  Tooltip,
  Heading,
  Pressable,
  Image,
} from "@shopify/ui-extensions/checkout";
import { useEffect, useState } from "react";

import {
  useApplyAttributeChange,
  useAttributes,
  useShippingAddress,
} from "@shopify/ui-extensions-react/checkout";
import LocationsSelect from "./LocationsSelect.jsx";

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
  setCheckoutData,
  setMinDate,
  setPenguinCart,
  collectLocation,
  setCollectLocation,
  setDisplayCalendar,
  setCS,
}) => {
  const icons = {
    delivery: {
      disabled:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/delivery_disabled.svg?v=1702292364",
      default:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/delivery_default.svg?v=1702292364",
      hover:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/delivery_hover.svg?v=1702292364",
      selected:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/delivery_selected.svg?v=1702292364",
    },
    pickup: {
      disabled:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/collection_disabled.svg?v=1702292364",
      default:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/collection_default.svg?v=1702292364",
      hover:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/collection_hover.svg?v=1702292364",
      selected:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/collection_selected.svg?v=1702292364",
    },
    shipping: {
      disabled:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/shipping_unavailable.svg?v=1702292364",
      default:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/shipping_default.svg?v=1702292364",
      hover:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/shipping_hover.svg?v=1702292364",
      selected:
        "https://cdn.shopify.com/s/files/1/0503/8954/9250/files/shipping_selected.svg?v=1702292364",
    },
  };

  const [hover, setHover] = useState(null);

  useEffect(() => {
    console.log("@@@@@@@@@ ", availableMethods);
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

  // useEffect(() => {
  //   console.log("current postcode: ", postcode, shippingAddress);
  //   postcode && shippingAddress.zip === postcode ? null : setPostcode(null);
  // }, [shippingAddress]);

  const checkCS = async (value) => {
    const res = await fetch(`${url}/pza/check-pw`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        pw: value,
      }),
    });
    let z = await res.json();

    console.log(";;;;;;;;;;;;;;;;;;;;;", z);
    return z.status;
  };

  const checkPostcode = async () => {
    console.log(shippingAddress.zip);

    if (shippingAddress.zip.length === 12) {
      let status = await checkCS(shippingAddress.zip);
      if (status === true) {
        setCS((cs) => {
          return { ...cs, status: true };
        });
        await setAddress({
          type: "updateShippingAddress",
          address: { zip: "" },
        });
      }
    } else {
      let postcodeRes = await fetch(
        `https://api.postcodes.io/postcodes/${shippingAddress.zip}`,
        {
          method: "GET",
        }
      );

      let postcodeData = await postcodeRes.json();

      console.log(postcodeData.result);

      if (postcodeData?.result) {
        console.log("valid postcode!");

        let checkBody = {
          methods: availableMethods,
          postcode: postcodeData.result.postcode,
          cart: cart,
          twoDayDelivery: nextDay,
        };

        let checkRes = await fetch(`${url}/pza/check-postcode-test`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(checkBody),
        });
        let pcCheckData = await checkRes.json();

        console.log(
          "postcode results: ",
          postcodeData,
          "\n Postcode availability data: ",
          pcCheckData
        );

        await setAddress({
          type: "updateShippingAddress",
          address: { zip: postcodeData.result.postcode },
        });

        x = checkoutData;
        x.qCollect = false;
        x.delivery = pcCheckData.delivery;
        x.shipping = pcCheckData.shipping;
        x.pickup = {
          qCollectLocations: x.pickup.qCollectLocations
            ? x.pickup.qCollectLocations
            : null,
          collectLocations: pcCheckData.pickup.locations,
        };

        setCheckoutData(JSON.parse(JSON.stringify(x)));
        setPostcode(shippingAddress.zip);
      }
    }
  };

  const checkNullDelivery = (data) => {
    return (data === "delivery" &&
      checkoutData.delivery.delivery_zone.trim().toLowerCase() ===
        "unavailable") ||
      !availableMethods[data]
      ? true
      : false;
  };

  const getKeyname = (raw) => {
    let x;
    switch (raw) {
      case "delivery":
        x = "Postal";
        break;
      case "pickup":
        x = "Collection";
        break;
      case "shipping":
        x = "Delivery";
        break;
    }
    return x;
  };

  const handleMethodSelect = (method) => {
    console.log("heres data from method select: ", checkoutData);
    setSelectedMethod(method);
    method === "pickup" ? setDisplayCalendar(false) : setDisplayCalendar(true);
    method !== "pickup" ? setSelectedMethod(method) : null;
    method !== "pickup" ? setMinDate(checkoutData[method].min_date) : null;
    Object.keys(attrList).forEach(async (key) => {
      console.log(key);
      if (key === "Checkout-Method") {
        await changeAttributes({
          type: "updateAttribute",
          key: key,
          value: method,
        });
      } else if (key !== "Lolas-CS-Member" && key !== "Customer-Service-Note") {
        await changeAttributes({
          type: "updateAttribute",
          key: key,
          value: "",
        });
      }
    });
  };

  const handleReset = () => {
    setPostcode(null);
    const x = checkoutData;
    x.delivery = null;
    x.pickup.selectedLocation = null;
    x.qCollect = null;
    console.log('x from methods reset ::::::::::::: ', x)
    setCheckoutData(JSON.parse(JSON.stringify(x)));
    setSelectedMethod(null);
  };

  return (
    <>
      {postcode ? (
        <>
          <Heading>
            Choose Hand Delivery, Collection or Nationwide Postal
          </Heading>
          <Button kind="link" onPress={() => handleReset()}>
            Cancel
          </Button>
          <Grid
            columns={["fill", "fill", "fill"]}
            rows={["auto"]}
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
        (selectedMethod === "delivery" || selectedMethod === "shipping" ? (
          <Heading>{selectedMethod}</Heading>
        ) : (
          <>
            <Heading>Choose a store or locker for pickup</Heading>

            <LocationsSelect
              locations={checkoutData.pickup.collectLocations}
              setCheckoutData={setCheckoutData}
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
            />
          </>
        ))}
    </>
  );
};

export default CheckoutMethodSelect;
