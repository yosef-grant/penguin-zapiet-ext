import React, { useEffect, useState, useLayoutEffect } from "react";

import {
  Heading,
  View,
  Select,
  TextField,
  Button,
  Spinner,
  Grid,
} from "@shopify/ui-extensions/checkout";

import {
  BlockSpacer,
  Icon,
  InlineSpacer,
  InlineStack,
  Pressable,
  useApi,
  useAppMetafields,
  useApplyAttributeChange,
  useAttributeValues,
  useAttributes,
  useStorage,
  Banner,
  Text,
  TextBlock,
} from "@shopify/ui-extensions-react/checkout";
import { getDay } from "date-fns";
import LocationsSelect from "./LocationsSelect.jsx";
import LockerCountdown from "./LockerCountdown.jsx";

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
  penguinCart,
  displayCalendar,
  selectedMethod,
  minDate
}) => {
  const nextDayMeta = useAppMetafields();
  const [reserveTime, setReserveTime] = useState(0);
  const [test, setTest] = useState('empty')
  const [loading, setLoading] = useState(
    checkoutData?.pickup?.qCollectLocations ? false : true
  );

  const changeAttributes = useApplyAttributeChange();
  const [disabled, setDisabled] = useState(false);

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

  const handleReset = async () => {
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
    });
  };

  return (
    <>
      <View
        padding={["loose", "none", "base", "none"]}
        blockAlignment="center"
        inlineAlignment={"center"}
        blockSize="fill"
      >
        {!!reserveTime && (
          <Banner status="success">
            <View blockAlignment={"center"} inlineAlignment={"center"}>
              <TextBlock>Locker reserved successfully!</TextBlock>
              <LockerCountdown reserveTime={reserveTime} />
            </View>
          </Banner>
        )}
        {!globalLoad ? (
          <View minInlineSize="fill" opacity={disabled ? 50 : 100}>
            {!!checkoutData?.pickup && displayCalendar && (
              <>
                {!checkoutData?.checkout_date ? (
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
                ) : (
                  <View
                    inlineAlignment="start"
                    blockAlignment="start"
                    blockSize="fill"
                    display="inline"
                  >
                    <Heading>
                      Collecting from:{" "}
                      {checkoutData.pickup.selectedLocation.info.company_name}
                    </Heading>
                  </View>
                )}
              </>
            )}
            {!!displayCalendar && minDate && selectedMethod && (
              <>
                <Calendar
                  minDate={minDate}
                  setCheckoutData={setCheckoutData}
                  checkoutData={checkoutData}
                  penguinCart={penguinCart}
                  lockerReserved={lockerReserved}
                  setLockerReserved={setLockerReserved}
                  url={app_url}
                  selectedMethod={selectedMethod}
                  setReserveTime={setReserveTime}
                  setTest={setTest}
                  prop={"prop"}
                />
                {!!checkoutData?.pickup?.selectedLocation &&
                  !!checkoutData?.checkout_date && (
                    <PickupInfoCard
                      location={checkoutData.pickup.selectedLocation}
                      checkoutData={checkoutData}
                    />
                  )}
              </>
            )}
          </View>
        ) : (
          <Spinner size="large" accessibilityLabel="Getting pickup locations" />
        )}
      </View>
    </>
  );
};

export default QuickCollect;
