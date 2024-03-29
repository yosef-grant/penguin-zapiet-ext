import { View, Heading, Spinner } from "@shopify/ui-extensions/checkout";
import { useEffect, useState } from "react";

import {
  useApplyAttributeChange,
  useApplyCartLinesChange,
  useAttributeValues,
  useAttributes,
  useCartLines,
  useDeliveryGroups,
  useShippingAddress,
  useStorage,
} from "@shopify/ui-extensions-react/checkout";

import LocationsSelect from "./LocationsSelect.jsx";
import CancelBtn from "./CancelBtn.jsx";
import CSPortal from "./CSPortal.jsx";
import Calendar from "./Calendar.jsx";
import BlockLoader from "./BlockLoader.jsx";
import MethodList from "./MethodList.jsx";
import Summary from "./Summary.jsx";
import LockerReserveAlert from "./LockerReserveAlert.jsx";

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
  resetMS,
  setCollectLocations,
  setMinDate,
  setPenguinCart,
  collectLocation,
  setCollectLocation,
  setDisplayCalendar,
  penguinCart,
  lockerReserved,
  setLockerReserved,
  cs,
  setCS,
  globalLoad,
  displayCalendar,
  selectLocation,
  confirmLocation,
  selectDates,
  penguinDelete,
  removeLocation,
}) => {
  /*
  TODO Implement reserve timer state for the method-select component (mirror quick collect)
  */

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState("");
  const [reserveTime, setReserveTime] = useState({});
  const [fetching, setFetching] = useState(false);
  const [optionsConfirmed, setOptionsConfirmed] = useState(false);
  const [buPostcode, setBuPostcode] = useState({});
  const [firstLoad, setFirstLoad] = useState(true);

  const attributes = useAttributes();

  const shippingAddress = useShippingAddress();
  const deliveryGroups = useDeliveryGroups();
  let setCartLineAttr = useApplyCartLinesChange();
  let cartLines = useCartLines();

  let changeAttributes = useApplyAttributeChange();

  let savedPath = useAttributeValues(["buyer-pathway"]);

  useEffect(() => {
    !!fetching
      ? setTimeout(() => {
          setFetching(false);
        }, 750)
      : null;
  }, [deliveryGroups]);

  useEffect(() => {
    savedPath[0] === "quick-collect"
      ? setDisabled(true)
      : !savedPath[0] && disabled
      ? (setDisabled(false), setSelectedMethod("pickup"))
      : null;
  }, [attributes]);

  useEffect(() => {
    console.log(
      "state of options confirmed at method-select: ",
      optionsConfirmed
    );
  }, [optionsConfirmed]);

  useEffect(() => {
    const handlePostcode = async () => {
      setError("");

      if (shippingAddress.zip.length < 12 && shippingAddress.zip.length > 0) {
        setLoading(true)
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
          setCollectLocations({
            delivery: pcCheckData.delivery,
            shipping: pcCheckData.shipping,
            pickup_locations: pcCheckData.pickup.locations,
          });
          setDisplayCalendar(false)

          // * show pickup method by default & show pickup rate
          setSelectedMethod("pickup");

          await setCartLineAttr({
            type: "updateCartLine",
            id: cartLines[0].id,
            attributes: [
              {
                key: "_deliveryID",
                value: "P",
              },
            ],
          });

          setPostcode(shippingAddress.zip);

        } else {
          setError("Postcode not recognised!");
          setPostcode(null);
        }
        setLoading(false);
      } else if (shippingAddress.zip.length === 12) {
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
        setLoading(false);
      }

       else {
        error ? setError('') : null;
        postcode ? setPostcode() : null;
       }
    };
    // if (!checkoutData.pickup?.selectedLocation) {
    // !displayCalendar && 
    
    shippingAddress?.zip !== postcode && !optionsConfirmed
      ? handlePostcode()
      : null;
  }, [shippingAddress]);

  useEffect(() => {
    console.log("******* available methods: ", availableMethods);
  }, [availableMethods]);

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

  // TODO combine with method select OR find alternative for CS portal behaviour
  // const checkPostcode = async () => {
  //   if (shippingAddress.zip) {
  //     setLoading(true);
  //     await changeAttributes({
  //       type: 'updateAttribute',
  //       key: 'buyer-pathway',
  //       value: 'method-select',
  //     });

  //     console.log(shippingAddress.zip);

  //     if (shippingAddress.zip.length === 12) {
  //       let status = await checkCS(shippingAddress.zip);
  //       if (status === true) {
  //         setCS((cs) => {
  //           return { ...cs, status: true };
  //         });
  //         await setAddress({
  //           type: 'updateShippingAddress',
  //           address: { zip: '' },
  //         });
  //       }
  //       setLoading(false);
  //     } else {

  //         setLoading(false);
  //       }
  //     }
  //   } else {
  //     setError('Enter a valid postcode');
  //   }
  // };

  // const handleReset = async () => {
  //   setPostcode(null);
  //   setSelectedMethod(null);
  //   setReserveTime({});
  //   resetMS();
  //   penguinDelete();
  //   displayCalendar ? setDisplayCalendar(false) : null;
  //   await changeAttributes({
  //     type: "updateAttribute",
  //     key: "buyer-pathway",
  //     value: "",
  //   });
  // };
  const handleReset = async () => {
    setDisplayCalendar(false);
    // resetMS();
    removeLocation();
    await changeAttributes({
      type: "updateAttribute",
      key: "buyer-pathway",
      value: "",
    });
  };

  return (
    <>
      {!!cs.status && (
        <CSPortal
          setCS={setCS}
          cs={cs}
          allLocations={checkoutData.pickup.qCollectLocations}
        />
      )}
      {globalLoad ? (
        <View blockAlignment="center" inlineAlignment={"center"}>
          <Spinner size="large" accessibilityLabel="Getting pickup locations" />
        </View>
      ) : (
        <>
          {!disabled && (
            <>
              {!!postcode && !loading ? (
                <>
                  {!!fetching ? (
                    <BlockLoader type="rates" />
                  ) : (
                    <>
                      {!optionsConfirmed ? (
                        <>
                          <View position={"relative"}>
                            <Heading level={2}>
                              Choose Hand Delivery, Collection or Nationwide
                              Postal
                            </Heading>
                            {selectedMethod === "pickup" &&
                              checkoutData.pickup?.selectedLocation && (
                                <CancelBtn handler={handleReset} />
                              )}
                            <MethodList
                              availableMethods={availableMethods}
                              selectedMethod={selectedMethod}
                              setFetching={setFetching}
                              setSelectedMethod={setSelectedMethod}
                              checkoutData={checkoutData}
                              reserveTime={reserveTime}
                              setReserveTime={setReserveTime}
                              setDisplayCalendar={setDisplayCalendar}
                              setMinDate={setMinDate}
                            />
                          </View>
                          {!!selectedMethod &&
                            selectedMethod === "pickup" &&
                            !displayCalendar && (
                              <LocationsSelect
                                locations={checkoutData.pickup.collectLocations}
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
                                pathway="method-select"
                                selectLocation={selectLocation}
                                confirmLocation={confirmLocation}
                                removeLocation={removeLocation}
                              />
                            )}
                          {((!!selectedMethod && selectedMethod !== "pickup") ||
                            (!!selectedMethod &&
                              selectedMethod === "pickup" &&
                              !!displayCalendar)) && (
                            <Calendar
                              minDate={
                                selectedMethod !== "pickup"
                                  ? checkoutData[selectedMethod].min_date
                                  : checkoutData.pickup.selectedLocation.dates
                                      .date
                              }
                              checkoutData={checkoutData}
                              penguinCart={penguinCart}
                              lockerReserved={lockerReserved}
                              setLockerReserved={setLockerReserved}
                              url={url}
                              selectedMethod={selectedMethod}
                              reserveTime={reserveTime}
                              setReserveTime={setReserveTime}
                              selectDates={selectDates}
                              setOptionsConfirmed={setOptionsConfirmed}
                              pathway={"method-select"}
                              setBuPostcode={setBuPostcode}
                            />
                          )}
                        </>
                      ) : (
                        <>
                          {!!reserveTime.expiry && (
                            <LockerReserveAlert reserveTime={reserveTime} />
                          )}
                          <Summary
                            selectedMethod={selectedMethod}
                            checkoutData={checkoutData}
                            postcode={postcode}
                            buPostcode={buPostcode}
                            setOptionsConfirmed={setOptionsConfirmed}
                            setSelectedMethod={setSelectedMethod}
                            removeLocation={removeLocation}
                          />
                        </>
                      )}
                    </>
                  )}
                </>
              ) : !postcode && shippingAddress.zip && !error || loading ? (
                <>
                  <BlockLoader type="postcode-fetch" />
                </>
              ) : !!error ? (
                <Heading>{error}</Heading>
              ) : null}
            </>
          )}
          {!!disabled && <Heading>Method select is disabled!</Heading>}
        </>
      )}
    </>
  );
};

export default CheckoutMethodSelect;
