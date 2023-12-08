import React, { useEffect, useState, useLayoutEffect } from "react";

import {
  Heading,
  View,
  Select,
  TextField,
  Button,
} from "@shopify/ui-extensions/checkout";

import {
  useApi,
  useAppMetafields,
  useApplyAttributeChange,
  useAttributeValues,
  useAttributes,
} from "@shopify/ui-extensions-react/checkout";
import { getDay } from "date-fns";
import LocationsSelect from "./LocationsSelect.jsx";

const QuickCollect = ({
  lineItems,
  changeShippingAddress,
  setQCollectLocation,
  qCollectLocation,
  cart,
  setMinDate,
  url,
  nextDay,
  setNextDay,
  setAttrList,
  setCheckoutData,
  setPenguinCart,
  setAvailableMethods,
}) => {
  useEffect(() => {
    console.log(";;;;; quick location ", qCollectLocation);
  }, [qCollectLocation]);

  const nextDayMeta = useAppMetafields();

  console.log("}}}}}}}}}}}}}}}}}", nextDayMeta);

  let meta = nextDayMeta.map((meta) => {
    return JSON.parse(meta.metafield.value).next_day_delivery.value;
  });
  console.log("meta: ", meta);
  meta.includes(1) || meta.includes(null)
    ? setNextDay(true)
    : setNextDay(false);

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("quick collect rendered: ", lineItems, locations);
    const validateCart = async () => {
      let res = await fetch(`${url}/pza/validate-cart-test`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(cart),
      });

      let resBody = await res.json();
      console.log(
        "TEST CART (Won't be matched on test server!): ",
        cart,
        resBody
      );
      setAvailableMethods(resBody.methods);
      setLocations(resBody.locations);
      setLoading(false);
    };
    validateCart();
  }, []);

  const handleReset = () => {
    setQCollectLocation(null);
    setMinDate(null);
    setCheckoutData({});
  };

  return (
    <View>
      <Heading>Quick Collection</Heading>

      {!loading && locations.length ? (
        <>
          {!!qCollectLocation && (
            <Button kind="plain" onPress={() => handleReset()}>
              Cancel
            </Button>
          )}
          <LocationsSelect
            locations={locations}
            setQCollectLocation={setQCollectLocation}
            qCollectLocation={qCollectLocation}
            isQCollect={true}
            setCheckoutData={setCheckoutData}
            setMinDate={setMinDate}
            nextDay={nextDay}
            cart={cart}
            setPenguinCart={setPenguinCart}
            url={url}
          />
        </>
      ) : (
        <Heading>Waiting...</Heading>
      )}
    </View>
  );
};

export default QuickCollect;
