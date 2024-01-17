import React, { useEffect, useState, useLayoutEffect } from 'react';

import {
  Heading,
  View,
  Spinner,
  Button,
  Text,
} from '@shopify/ui-extensions/checkout';

import {
  useAppMetafields,
  useApplyAttributeChange,
  useApplyShippingAddressChange,
  useAttributeValues,
  useAttributes,
  useShippingAddress,
  useStorage,
} from '@shopify/ui-extensions-react/checkout';
import { getDay } from 'date-fns';
import LocationsSelect from './LocationsSelect.jsx';
import LockerCountdown from './LockerCountdown.jsx';
import Calendar from './Calendar.jsx';
import PickupInfoCard from './PickupInfoCard.jsx';
import CancelBtn from './CancelBtn.jsx';
import DisabledState from './DisabledState.jsx';

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
  penguinDelete,
}) => {
  const nextDayMeta = useAppMetafields();
  const [reserveTime, setReserveTime] = useState({});
  const [searchQuery, setSearchQuery] = useState(null);

  const changeAttributes = useApplyAttributeChange();
  const [disabled, setDisabled] = useState(false);

  const shippingAddress = useShippingAddress();

  const attributes = useAttributes();
  const storage = useStorage();

  // console.log("}}}}}}}}}}}}}}}}}", nextDayMeta, checkoutData);


  let savedPath = useAttributeValues(['buyer-pathway']);

  useEffect(() => {
    console.log('should calendar display? ', displayCalendar);
  }, [displayCalendar]);

  useEffect(() => {
    const checkParity =
      savedPath[0] === 'quick-collect' &&
      checkoutData.pickup?.selectedLocation &&
      (shippingAddress.address1 !==
        checkoutData.pickup.selectedLocation.info.address_line_1 ||
        shippingAddress.city !==
          checkoutData.pickup.selectedLocation.info.city ||
        shippingAddress.zip !==
          checkoutData.pickup.selectedLocation.info.postal_code)
        ? false
        : true;

    !checkParity
      ? changeShippingAddress({
          type: 'updateShippingAddress',
          address: {
            address1: checkoutData.pickup.selectedLocation.info.address_line_1,
            city: checkoutData.pickup.selectedLocation.info.city,
            zip: checkoutData.pickup.selectedLocation.info.postal_code,
          },
        })
      : null;
  }, [shippingAddress]);

  useEffect(() => {
    savedPath[0] === 'method-select'
      ? setDisabled(true)
      : !savedPath[0] && disabled
      ? setDisabled(false)
      : null;
  }, [attributes]);

  useEffect(() => {
    console.log('global load from qc: ', globalLoad);
  }, [globalLoad]);

  useEffect(() => {
    updateNextDayMeta = () => {
      let meta = nextDayMeta.map((meta) => {
        return JSON.parse(meta.metafield.value).next_day_delivery.value;
      });
      console.log('meta: ', meta);
      meta.includes(1) || meta.includes(null)
        ? setNextDay(true)
        : setNextDay(false);
    };

    updateNextDayMeta();
  }, []);

  const handleReset = async () => {
    setDisplayCalendar(false);
    
    removeLocation();
    penguinDelete();
    setReserveTime({});
    await changeAttributes({
      type: 'updateAttribute',
      key: 'buyer-pathway',
      value: '',
    });
  };



  return (
    <>
      <Heading level={1}>Easy Collect</Heading>
      <Text>Alreay know where you'd like to pick up your order?</Text>
      {checkoutData?.pickup?.selectedLocation &&
        checkoutData?.pickup?.selectedLocation?.dates && (
          <CancelBtn handler={() => handleReset()} />
        )}
      <View
        padding={['loose', 'none', 'base', 'none']}
        blockAlignment="center"
        inlineAlignment={'center'}
        blockSize="fill"
        position="relative"
   
      >
        {!globalLoad ? (
          <>
            {!disabled ? (
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
                        pathway="quick-collect"
                        disabled={disabled}
                        selectLocation={selectLocation}
                        confirmLocation={confirmLocation}
                        removeLocation={removeLocation}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                      />
                    ) : (
                      <View
                        inlineAlignment="start"
                        blockAlignment="start"
                        blockSize="fill"
                        display="inline"
                      >
                        <Heading>
                          Collecting from:{' '}
                          {
                            checkoutData.pickup.selectedLocation.info
                              .company_name
                          }
                        </Heading>
                      </View>
                    )}
                  </>
                )}
                {!!displayCalendar && (
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
                    pathway={'quick-collect'}
                  />
                )}
              </View>
            ) : (
              <DisabledState />
            )}
          </>
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
