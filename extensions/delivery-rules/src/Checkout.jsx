import React, { useEffect, useState, useLayoutEffect, useReducer } from 'react';

import {
  reactExtension,
  useApplyShippingAddressChange,
  useCartLines,
  useAttributes,
  useBuyerJourneyIntercept,
  useApi,
  useApplyAttributeChange,
} from '@shopify/ui-extensions-react/checkout';

import QuickCollect from './QuickCollect.jsx';
import CheckoutMethodSelect from './CheckoutMethodSelect.jsx';

import { checkoutDataReducer } from './reducer_functions/CheckoutDataMethods.jsx';



// const QuickCollectRender = reactExtension(
//   'purchase.checkout.block.render',
//   () => <TestQC />
// );

// const MethodSelectRender = reactExtension(
//   'purchase.checkout.delivery-address.render-before',
//   () => <TestMS />
// );





const QuickCollectRender = reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />
);

const MethodSelectRender = reactExtension(
  'purchase.checkout.shipping-option-list.render-before',
  () => <Extension />
);

export { QuickCollectRender, MethodSelectRender };

function Extension() {
  const [checkoutData, dispatch] = useReducer(checkoutDataReducer, {});

  const handleSetQLocations = (locations) => {
    dispatch({
      type: 'acquired_q_locations',
      all_locations: locations,
    });
  };

  const handleSetCollectLocations = (data) => {
    dispatch({
      type: 'acquired_general_delivery_info',
      data: data,
    });
  };

  const handleRemoveSelectedLocation = () => {
    dispatch({
      type: 'selected_pickup_location_removed',
    });
  };

  const handleSelectPickupLocation = (hours, description, location) => {
    dispatch({
      type: 'selected_pickup_location_added',
      hours: hours,
      description: description,
      location: location,
    });
  };

  const handleConfirmPickupLocation = (dates) => {
    dispatch({
      type: 'selected_pickup_location_confirmed',
      location_dates: dates,
    });
  };

  const handleSelectDates = (date, weekday) => {
    dispatch({
      type: 'selected_dates',
      date: date,
      weekday: weekday,
    });
  };

  const handleMSReset = () => {
    dispatch({
      type: 'reset_MS_Checkout',
    });
  };



  const [qCollectLocation, setQCollectLocation] = useState(null);
  const [minDate, setMinDate] = useState(null);
  const [nextDay, setNextDay] = useState(false);
  const [availableMethods, setAvailableMethods] = useState(null);
  const [penguinCart, setPenguinCart] = useState(null);
  const [lockerReserved, setLockerReserved] = useState(false);
  const [collectLocation, setCollectLocation] = useState(null);
  const [displayCalendar, setDisplayCalendar] = useState(false);
  const [postcode, setPostcode] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cs, setCS] = useState({ status: false });

  const [globalLoad, setGlobalLoad] = useState(true);
  const [testnum, setTestnum] = useState(1);

  const lineItems = useCartLines();

  useEffect(() => {
    console.log(':><: THIS IS THE CURRENT PENGUIN CART: ', penguinCart);
  }, [penguinCart]);

  const app_url = 'https://4fe3-212-140-232-13.ngrok-free.app';

  let changeAttributes = useApplyAttributeChange();

  const { extension } = useApi();

  // console.log("@@@@@@@@@@@@ capabilities ", extension, extension.target);

  const attr = useAttributes();

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  // * Uncomment to track CART attributes:
  // console.log(attributes);

  // TODO delete penguin order if reservation confirmed and user hits X button
  // TODO hide reservation banner

  useEffect(() => {
    // const t =  () => {
    //   t();
    // }
    // TODO remove penguin attribute values on first APP render
    Object.keys(attributes).forEach(async (key) => {
      await changeAttributes({
        type: 'updateAttribute',
        key: key,
        value: '',
      });
    });
  }, []);

  // initial validation
  useEffect(() => {
    console.log('quick collect rendered: ', lineItems);

    const validateCart = async () => {
      let res = await fetch(`${app_url}/pza/validate-cart-test`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(cart),
      });

      let resBody = await res.json();
      console.log(
        "TEST CART (Won't be matched on test server!): ",
        cart,
        resBody
      );
      setAvailableMethods(resBody.methods);
      handleSetQLocations(resBody.locations);
      setGlobalLoad(false);
    };
    checkoutData.pickup?.qCollectLocations.length ? null : validateCart();
  }, []);

  //console.table(attributes);

  const cart = lineItems.map((item) => {
    return {
      variant_id: item.merchandise.id.replace(/\D/g, ''),
      product_id: item.merchandise.product.id.replace(/\D/g, ''),
      quantity: item.quantity,
    };
  });
  const changeShippingAddress = useApplyShippingAddressChange();



  useEffect(() => {
    console.log('##################checkout data ', checkoutData);
  }, [checkoutData]);

  useEffect(() => {
    console.log('++++++++++++++ cs updated: ', cs);
  }, [cs]);

  // use to intercept rogue behaviour that will screw up rates
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    return canBlockProgress && attributes['Checkout-Method']
      ? {
          behavior: 'block',
          reason: 'Invalid shipping country',
          errors: [
            {
              // An error without a `target` property is shown at page level
              message: 'Sorry, we can only ship to Canada',
            },
          ],
        }
      : {
          behavior: 'allow',
        };
  });

  const deletePenguinReservation = async () => {
    console.log(attributes);
    if (attributes?.['Pickup-Penguin-Id']) {
      console.log('&&&&&&&  penguin reservation in place - should be deleted');
      try {
        await fetch(`${app_url}/pza/delete-locker`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ locker_id: attributes['Pickup-Penguin-Id'] }),
        });
      } catch (error) {
        console.error(
          `Failed to delete locker order ${attributes['Pickup-Penguin-Id']}`
        );
      }
    } else return;
  };

  return (
    <>
      {extension.target === 'purchase.checkout.block.render' ? (
        <>
          <QuickCollect
            lineItems={lineItems}
            changeShippingAddress={changeShippingAddress}
            setQCollectLocation={setQCollectLocation}
            qCollectLocation={qCollectLocation}
            cart={cart}
            checkoutData={checkoutData}
            setMinDate={setMinDate}
            nextDay={nextDay}
            url={app_url}
            setNextDay={setNextDay}
            penguinCart={penguinCart}
            setPenguinCart={setPenguinCart}
            setAvailableMethods={setAvailableMethods}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
            displayCalendar={displayCalendar}
            setDisplayCalendar={setDisplayCalendar}
            globalLoad={globalLoad}
            setGlobalLoad={setGlobalLoad}
            minDate={minDate}
            lockerReserved={lockerReserved}
            setLockerReserved={setLockerReserved}
            selectLocation={handleSelectPickupLocation}
            confirmLocation={handleConfirmPickupLocation}
            selectDates={handleSelectDates}
            removeLocation={handleRemoveSelectedLocation}
            penguinDelete={deletePenguinReservation}
          />
        </>
      ) : extension.target ===
        'purchase.checkout.shipping-option-list.render-before' ? (
        <>
          <CheckoutMethodSelect
            availableMethods={availableMethods}
            postcode={postcode}
            setPostcode={setPostcode}
            cart={cart}
            nextDay={nextDay}
            url={app_url}
            setAddress={changeShippingAddress}
            setSelectedMethod={setSelectedMethod}
            selectedMethod={selectedMethod}
            penguinCart={penguinCart}
            lockerReserved={lockerReserved}
            setLockerReserved={setLockerReserved}
            setMinDate={setMinDate}
            setPenguinCart={setPenguinCart}
            setCollectLocation={setCollectLocation}
            collectLocation={collectLocation}
            cs={cs}
            setCS={setCS}
            setDisplayCalendar={setDisplayCalendar}
            checkoutData={checkoutData}
            globalLoad={globalLoad}
            setGlobalLoad={setGlobalLoad}
            setTestnum={setTestnum}
            displayCalendar={displayCalendar}
            selectLocation={handleSelectPickupLocation}
            confirmLocation={handleConfirmPickupLocation}
            selectDates={handleSelectDates}
            setCollectLocations={handleSetCollectLocations}
            resetMS={handleMSReset}
            removeLocation={handleRemoveSelectedLocation}
            penguinDelete={deletePenguinReservation}
          />
        </>
      ) : null}
    </>
  );
}


<script>
  let 
</script>