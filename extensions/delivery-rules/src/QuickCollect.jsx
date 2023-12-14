import React, { useEffect, useState, useLayoutEffect } from "react";

import {
  Heading,
  View,
  Select,
  TextField,
  Button,
  Spinner,
} from "@shopify/ui-extensions/checkout";

import {
  useApi,
  useAppMetafields,
  useApplyAttributeChange,
  useAttributeValues,
  useAttributes,
  useStorage,
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
  globalLoad,
  setGlobalLoad,
}) => {
  const nextDayMeta = useAppMetafields();
  const [loading, setLoading] = useState(
    checkoutData?.pickup?.qCollectLocations ? false : true
  );

  
  const storage = useStorage();

  console.log("}}}}}}}}}}}}}}}}}", nextDayMeta, checkoutData);

  useEffect(() => {
    const checkStorage = async () => {
      let s = await storage.read("pathway");
      console.log("!!!!!!!!!!!!!!!from quickCollect: ", s);
    };
    checkStorage();
  }, []);



  useEffect(() => {
    console.log("global load from qc: ", globalLoad);
  }, [globalLoad]);

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

  const handleReset = () => {
    setMinDate(null);
    let x = checkoutData;
    x.qCollect = false;
    x.pickup.selectedLocation = null;

    setCheckoutData(JSON.parse(JSON.stringify(x)));
    setDisplayCalendar(false);
  };

  return (
    <View
      padding={["base", "none", "base", "none"]}
      blockAlignment="center"
      inlineAlignment={"center"}
    >
      {!globalLoad ? (
        <View minInlineSize="fill">
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
        </View>
      ) : (
        <Spinner size="large" accessibilityLabel="Getting pickup locations" />
      )}
    </View>
  );
};

export default QuickCollect;
