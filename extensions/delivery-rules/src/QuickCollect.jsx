import React, { useEffect, useState, useLayoutEffect } from "react";

import {
  Heading,
  View,
  Select,
  TextField,
  Button,
  Spinner,
  Grid,
  InlineLayout,
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
import Calendar from "./Calendar.jsx";
import PickupInfoCard from "./PickupInfoCard.jsx";
import BlockLoader from "./BlockLoader.jsx";

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

  setPenguinCart,
  setAvailableMethods,
  setSelectedMethod,
  globalLoad,
  penguinCart,
  displayCalendar,
  selectedMethod,
  minDate,
  lockerReserved,
  setLockerReserved,
  selectLocation,
  confirmLocation, 
  selectDates,
  removeLocation,
  
}) => {
  const nextDayMeta = useAppMetafields();
  const [reserveTime, setReserveTime] = useState({});


  const changeAttributes = useApplyAttributeChange();
  const [disabled, setDisabled] = useState(false);

  const attributes = useAttributes();
  const storage = useStorage();

  // console.log("}}}}}}}}}}}}}}}}}", nextDayMeta, checkoutData);

  let savedPath = useAttributeValues(["buyer-pathway"]);

  useEffect(() => {
    console.log("should calendar display? ", displayCalendar);
  }, [displayCalendar]);

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

  return (
    <>
      <View
        padding={["loose", "none", "base", "none"]}
        blockAlignment="center"
        inlineAlignment={"center"}
        blockSize="fill"
        position="relative"
      >
        {!globalLoad ? (
          <View minInlineSize="fill" opacity={disabled ? 50 : 100}>
            {!!checkoutData?.pickup && (
              <>
                {!displayCalendar ? (
                  <LocationsSelect
                    locations={checkoutData.pickup.qCollectLocations}
                    checkoutData={checkoutData}
                    setMinDate={setMinDate}
                    nextDay={nextDay}
                    cart={cart}
                    setPenguinCart={setPenguinCart}
                    url={url}
                    setSelectedMethod={setSelectedMethod}
                    setDisplayCalendar={setDisplayCalendar}
                    pathway={"quick-collect"}
                    disabled={disabled}
                    selectLocation={selectLocation}
                    confirmLocation={confirmLocation}
                    removeLocation={removeLocation}
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
            {!!displayCalendar && (
              <>
                <Calendar
                  minDate={minDate}
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

                {!!checkoutData?.pickup?.selectedLocation &&
                  !!checkoutData?.checkout_date && (
                    <PickupInfoCard
                      location={checkoutData.pickup.selectedLocation}
                      checkoutData={checkoutData}
                    />
                  )}
              </>
            )}
            {!!reserveTime?.expiry && (
              <View padding={["tight", "none", "none", "none"]}>
                <Banner status="success">
                  <View
                    blockAlignment={"start"}
                    inlineAlignment={"start"}
                    display="inline"
                    minInlineSize={"fill"}
                  >
                    <InlineLayout
                      columns={[`${50}%`, `${50}%`]}
                      minInlineSize={"fill"}
                    >
                      <View>
                        <Text>Locker reserved successfully!</Text>
                      </View>

                      <View inlineAlignment="end">
                        <LockerCountdown reserveTime={reserveTime} />
                      </View>
                    </InlineLayout>
                  </View>
                </Banner>
              </View>
            )}
          </View>
        ) : (
          <Spinner
            size="large"
            accessibilityLabel="Getting pickup locations list"
          />
        )}
      </View>
    </>
  );
};

export default QuickCollect;
