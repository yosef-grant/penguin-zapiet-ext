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
  cart,
  setMinDate,
  url,
  nextDay,
  setNextDay,
  setDisplayCalendar,
  checkoutData,
  setCheckoutData,
  setPenguinCart,
  setAvailableMethods,
  setSelectedMethod,
}) => {
  const nextDayMeta = useAppMetafields();
  const [loading, setLoading] = useState(
    checkoutData?.pickup?.qCollectLocations ? false : true
  );

  console.log("}}}}}}}}}}}}}}}}}", nextDayMeta, checkoutData);

  useEffect(() => {
    updateNextDayMeta = () => {
      let meta = nextDayMeta.map((meta) => {
        return JSON.parse(meta.metafield.value).next_day_delivery.value;
      });
      console.log("meta: ", meta);
      meta.includes(1) || meta.includes(null)
        ? setNextDay(true)
        : setNextDay(false);
    };

    updateNextDayMeta();
  }, []);

  useEffect(() => {
    console.log("quick collect rendered: ", lineItems);

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
      let x = checkoutData;
      x.pickup = { qCollectLocations: resBody.locations };

      setCheckoutData(JSON.parse(JSON.stringify(x)));
      setLoading(false);
    };
    checkoutData.pickup?.qCollectLocations.length ? null : validateCart();
  }, []);

  const handleReset = () => {
    setMinDate(null);
    let x = checkoutData;
    x.qCollect = false;
    x.pickup.selectedLocation = null;
 
    setCheckoutData(JSON.parse(JSON.stringify(x)));
    setDisplayCalendar(false);
  };

  return (
    <View>
      <Heading>Quick Collection</Heading>

      {!loading ? (
        <>
          {checkoutData.pickup?.selectedLocation && (
            <Button kind="plain" onPress={() => handleReset()}>
              Cancel
            </Button>
          )}
          {!!checkoutData?.pickup && (
            <LocationsSelect
              locations={checkoutData.pickup.qCollectLocations}
              checkoutData={checkoutData}
              setCheckoutData={setCheckoutData}
              setMinDate={setMinDate}
              nextDay={nextDay}
              cart={cart}
              setPenguinCart={setPenguinCart}
              url={url}
              setSelectedMethod={setSelectedMethod}
              setDisplayCalendar={setDisplayCalendar}
            />
          )}
        </>
      ) : (
        <Heading>Waiting...</Heading>
      )}
    </View>
  );
};

export default QuickCollect;
