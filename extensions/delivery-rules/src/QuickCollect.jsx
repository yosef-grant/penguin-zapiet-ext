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

  const [disabled, setDisabled] = useState(false);

  const changeAttributes = useApplyAttributeChange()

  const attributes = useAttributes();
  const storage = useStorage();

  console.log("}}}}}}}}}}}}}}}}}", nextDayMeta, checkoutData);

  let savedPath = useAttributeValues(["buyer-pathway"]);


  useEffect(() => {
    savedPath[0] === "method-select"
      ? setDisabled(true)
      : !savedPath[0] && disabled
      ? setDisabled(false)
      : null;
  }, [attributes]);




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

  const handleReset = async() => {

    setMinDate(null);
    let x = checkoutData;
    x.qCollect = false;
    x.pickup.selectedLocation = null;
    
    setCheckoutData(JSON.parse(JSON.stringify(x)));
    setDisplayCalendar(false);
    await changeAttributes({
      type: "updateAttribute",
      key: "buyer-pathway",
      value: "",
    })
  };

  return (
    <View
      padding={["base", "none", "base", "none"]}
      blockAlignment="center"
      inlineAlignment={"center"}
    >
      {!globalLoad ? (
        <View minInlineSize="fill" opacity={disabled ? 50 : 100}>
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
              pathway={"quick-collect"}
              disabled={disabled}
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
