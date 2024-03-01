import {
  View,
  ChoiceList,
  Choice,
  Heading,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
import React, { useEffect, useState } from "react";
import AltCalendar from "./AltCalendar.jsx";
import DeliveryEmptyState from "./DeliveryEmptyState.jsx";
import DeliveryTypeSelect from "./DeliveryTypeSelect.jsx";
import { addYears, format, getDay } from "date-fns";
import BlockLoader from "./BlockLoader.jsx";

const DateSelect = ({
  attributes,
  currentShippingAddress,
  checkoutData,
  cart,
  appMeta,
  url,
  handleMethodSelect,
  setCartLineAttr,
  setAvailableMethods,
  availableMethods,
  localStorage,
  changeAttributes,
  
}) => {
  console.log(
    "current attributes: ",
    attributes,
    currentShippingAddress,
    checkoutData
  );

  const { query } = useApi();

  // todo lift minDate and disabledDates into this component and pass them down into child

  const [methodData, setMethodData] = useState(null);
  const [deliveryType, setDeliveryType] = useState("driver-delivery");
  const [deliveryZone, setDeliveryZone] = useState(null);

  const [minDate, setMinDate] = useState(null);
  const [blackoutDates, setBlackoutDates] = useState(null);

  const [fetching, setFetching] = useState(true);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const [hideCalendar, setHideCalendar] = useState(false);

  const [pickupLocationInfo, setPickupLocationInfo] = useState(null);

  const [displayDatePicker, setDisplayDatePicker] = useState(false);

  console.log("date select render ", minDate, currentShippingAddress);

  useEffect(() => {
    console.log("ADDRESS CHANGE: ", currentShippingAddress);
    const getPickupDates = async () => {
      setFetching(true);
      let store = await localStorage.read("selected_location_info");
      console.log("STORE!! ", store);

      if (store) {
        let nextDayMeta = appMeta.map((meta) => {
          return JSON.parse(meta.metafield.value).next_day_delivery.value;
        });
        let nextDay =
          nextDayMeta.includes(1) || nextDayMeta.includes(null) ? true : false;

        // let selectedLocation = checkoutData.pickup.qCollectLocations.filter(location => {
        //   return location.postal_code === currentShippingAddress.zip
        // })

        let resBody = {
          cart: cart,
          locationId: attributes["Pickup-Location-Id"],
          locationType: attributes["Pickup-Location-Type"],
          twoDayDelivery: nextDay,
        };
        let res = await fetch(`${url}/pza/pickup-dates-test`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(resBody),
        });
        let data = await res.json();
        console.log(
          "================================= dates for pickup location!",
          data,
          "\n",
          resBody
        );

        // let minDay = format(
        //   getDay(new Date(data.minDate)) + 1,
        //   'EEEE'
        // ).toLowerCase();

        let x = {
          id: store.location.id,
          is_locker:
            store.location.custom_attribute_1 === "lockers" ? true : false,
          store_hours: store.hours,
        };
        setPickupLocationInfo(x);
        setMethodData(data);
        setBlackoutDates(data.blackout_dates);
        setMinDate(data.minDate);
        setFetching(false);
      }
    };

    const getDeliveryDates = async () => {
      setFetching(true);
      let availability = await localStorage.read("availability");
      console.log("UILP ", availability);
      setAvailableMethods(availability.methods);
      let nextDayMeta = appMeta.map((meta) => {
        return JSON.parse(meta.metafield.value).next_day_delivery.value;
      });
      let nextDay =
        nextDayMeta.includes(1) || nextDayMeta.includes(null) ? true : false;

      let checkBody = {
        type: "delivery",
        postcode: currentShippingAddress.zip,
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
      let delData = await checkRes.json();

      console.log(
        "Postcode availability data from date select: ",
        delData,
        cart[0].attributes[0].value,
        availableMethods
      );

      // delData.delivery.delivery_zone !== "unavailable"
      // && cart[0]

      if (
        delData?.delivery?.delivery_zone === "unavailable" &&
        availability.methods.shipping === false
      ) {
        await setCartLineAttr({
          type: "updateCartLine",
          id: cart[0].id,
          attributes: [
            ...cart[0].attributes,
            {
              key: "_deliveryID",
              value: `U`,
            },
          ],
        });
        setMinDate(null);
      }

      if (delData.delivery.delivery_zone !== "unavailable") {
        let dz = delData.delivery.delivery_zone.replace(/[^0-9.]/g, "");
        await setCartLineAttr({
          type: "updateCartLine",
          id: cart[0].id,
          attributes: [
            ...cart[0].attributes,
            {
              key: "_deliveryID",
              value: `D%${dz}`,
            },
          ],
        }),
          setDeliveryType("driver-delivery");


        setBlackoutDates(delData.delivery.blackouts);
        setMinDate(delData.delivery.min_date);
      }

      if (
        delData.delivery.delivery_zone === "unavailable" &&
        availability.methods.shipping === true
      ) {
        await setCartLineAttr({
          type: "updateCartLine",
          id: cart[0].id,
          attributes: [
            ...cart[0].attributes,
            {
              key: "_deliveryID",
              value: `S`,
            },
          ],
        }),
          await changeAttributes({
            type: "updateAttribute",
            key: "Checkout-Method",
            value: "shipping",
          });
        Object.keys(attributes).forEach(async (key) => {
          if (key.includes("Delivery")) {
            await changeAttributes({
              type: "updateAttribute",
              key: key,
              value: "",
            });
          }
        });

        setDeliveryType("postal");
        setBlackoutDates(delData.shipping.blackouts);
        setMinDate(delData.shipping.min_date);
      }

      // hideCalendar ? setHideCalendar(false) : null
      setDeliveryZone(delData.delivery.delivery_zone);
      setMethodData(JSON.parse(JSON.stringify(delData)));
      setFetching(false);
    };

    if (
      attributes?.["Checkout-Method"] === "pickup"

      //&&      currentShippingAddress !== ""
    ) {
      console.log("refreshing PICKUP DATA");
      getPickupDates();
    } else if (
      attributes?.["Checkout-Method"] === "delivery" &&
      currentShippingAddress.zip

      //&& currentShippingAddress !== ""
    ) {
      console.log("refreshing DELIVERY DATA");
      getDeliveryDates();
    }
  }, [currentShippingAddress.zip]);

  // // TODO useEffect to handle ["Checkout-Method"] switching whilst the calendar is active

  // useEffect(() => {
  //   console.log(
  //     'THE CHECKOUT METHOD HAS BEEN CHANGED: ',
  //     attributes['Checkout-Method']
  //   );
  // }, [attributes['Checkout-Method']]);

  // useEffect(() => {
  //   const checkLocalStorage = async () => {

  //     store.location.id === parseInt(attributes['Pickup-Location-Id'])

  //       ? setSelectedLocation(store)
  //       : null;
  //   };

  //   attributes['Checkout-Method'] === 'pickup' ? checkLocalStorage() : null;
  // }, [localStorage]);

  return (
    <View>
      {!fetching ? (
        <>
          {!!minDate && methodData && (
            <>
              {(attributes["Checkout-Method"] === "delivery" ||
                attributes["Checkout-Method"] === "shipping") &&
                availableMethods && (
                  <DeliveryTypeSelect
                    setDeliveryType={setDeliveryType}
                    deliveryType={deliveryType}
                    setCartLineAttr={setCartLineAttr}
                    methodData={methodData}
                    availableMethods={availableMethods}
                    cart={cart}
                    setBlackoutDates={setBlackoutDates}
                    changeAttributes={changeAttributes}
                    attributes={attributes}
                  />
                )}
              <AltCalendar
                rate={cart[0].attributes[0].value}
                deliveryZone={deliveryZone}
                attributes={attributes}
                deliveryType={deliveryType}
                minDate={minDate}
                blackoutDates={blackoutDates}
                pickupLocationInfo={pickupLocationInfo}
                changeAttributes={changeAttributes}
                localStorage={localStorage}
              
              />
            </>
          )}
          {!minDate && methodData && (
            <DeliveryEmptyState handleMethodSelect={handleMethodSelect} />
          )}
        </>
      ) : (
        <BlockLoader
          message={`Getting ${
            attributes["Checkout-Method"] === "pickup"
              ? "collection"
              : "delivery"
          } dates...`}
        />
      )}
    </View>
  );
};

export default DateSelect;

