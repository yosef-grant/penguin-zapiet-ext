import { Heading } from "@shopify/ui-extensions-react/checkout";
import React, { useEffect, useState } from "react";
import Calendar from "./Calendar.jsx";
import DeliveryToggle from "./DeliveryToggle.jsx";

const DateSelect = ({
  selectedMethod,
  locationId,
  locationType,
  locationHandle,
  appMeta,
  cart,
  appUrl,
  changeAttributes,
  delDate,
  currentShippingAddress,
  setCartLineAttr,
  attributes,
}) => {
  const [fetching, setFetching] = useState(true);
  const [minDate, setMinDate] = useState(null);
  const [blackoutDates, setBlackoutDates] = useState(null);
  const [locationHours, setLocationHours] = useState(null);
  const [locationDescription, setLocationDescription] = useState(null);
  const [deliveryType, setDeliveryType] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [currentDeliveryPostcode, setCurrentDeliveryPostcode] = useState(null);

  useEffect(() => {
    const getPickupDates = async () => {
      console.log("getting pickup data: ", locationId, locationType);
      let nextDayMeta = appMeta.map((meta) => {
        return JSON.parse(meta.metafield.value).next_day_delivery.value;
      });
      let nextDay =
        nextDayMeta.includes(1) || nextDayMeta.includes(null) ? true : false;

      // let selectedLocation = checkoutData.pickup.qCollectLocations.filter(location => {
      //   return location.postal_code === currentShippingAddress.zip
      // })

      console.log("IS PRODUCT NEXT DAY? ", nextDay);

      let resBody = {
        cart: cart,
        locationId: locationId,
        locationType: locationType,
        locationHandle: locationHandle,
        twoDayDelivery: nextDay,
      };
      let res = await fetch(`${appUrl}/pza/pickup-dates-test`, {
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

      // let x = {
      //   id: store.location.id,
      //   is_locker:
      //     store.location.custom_attribute_1 === "lockers" ? true : false,
      //   store_hours: store.hours,
      // };
      // setPickupLocationInfo(x);
      // setMethodData(data);

      setLocationDescription(data.description);
      setLocationHours(data.hours);
      setBlackoutDates(data.blackout_dates);
      setMinDate(data.minDate);

      console.log("new min date: ", minDate);
      setFetching(false);
    };

    const getDeliveryDates = async () => {
      if (currentShippingAddress.zip !== currentDeliveryPostcode) {
        console.log(
          "POSTCODE MISMATCHED - GATHERING NEW DATA: ",
          "\npostcode from shipping address: ",
          currentShippingAddress.zip,
          "\npostcode from state: ",
          currentDeliveryPostcode
        );
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

        let checkRes = await fetch(`${appUrl}/pza/check-postcode-test`, {
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
          "current postcode: ",
          currentShippingAddress.zip
        );
        //setDeliveryType(delData.delivery.delivery_zone !== "unavailable" ? "driver-delivery" : "postal")
        setDeliveryType(attributes["Checkout-Method"] === "delivery" ? "driver-delivery" : "postal")

        setDeliveryData(delData);

        // delData.delivery.delivery_zone !== "unavailable"
        // && cart[0]

        // if (
        //   delData?.delivery?.delivery_zone === "unavailable" &&
        //   availability.methods.shipping === false
        // ) {
        //   await setCartLineAttr({
        //     type: "updateCartLine",
        //     id: cart[0].id,
        //     attributes: [
        //       ...cart[0].attributes,
        //       {
        //         key: "_deliveryID",
        //         value: `U`,
        //       },
        //     ],
        //   });
        //   setMinDate(null);
        // }

        if (attributes["Checkout-Method"] === "delivery" && delData.delivery.delivery_zone !== "unavailable") {
          //   let dz = delData.delivery.delivery_zone.replace(/[^0-9.]/g, "");
          //   await setCartLineAttr({
          //     type: "updateCartLine",
          //     id: cart[0].id,
          //     attributes: [
          //       ...cart[0].attributes,
          //       {
          //         key: "_deliveryID",
          //         value: `D%${dz}`,
          //       },
          //     ],
          //   }),
          //     setDeliveryType("driver-delivery");

          setBlackoutDates(delData.delivery.blackouts);
          setMinDate(delData.delivery.min_date);
        }
        else if (attributes["Checkout-Method"] === "shipping") {
          setBlackoutDates(delData.shipping.blackouts);
          setMinDate(delData.shipping.min_date);
        }
        

        // if (
        //   delData.delivery.delivery_zone === "unavailable" &&
        //   availability.methods.shipping === true
        // ) {
        //   await setCartLineAttr({
        //     type: "updateCartLine",
        //     id: cart[0].id,
        //     attributes: [
        //       ...cart[0].attributes,
        //       {
        //         key: "_deliveryID",
        //         value: `S`,
        //       },
        //     ],
        //   }),
        //     await changeAttributes({
        //       type: "updateAttribute",
        //       key: "Checkout-Method",
        //       value: "shipping",
        //     });
        //   Object.keys(attributes).forEach(async (key) => {
        //     if (key.includes("Delivery")) {
        //       await changeAttributes({
        //         type: "updateAttribute",
        //         key: key,
        //         value: "",
        //       });
        //     }
        //   });

        //   setDeliveryType("postal");
        //   setBlackoutDates(delData.shipping.blackouts);
        //   setMinDate(delData.shipping.min_date);
        // }

        // // hideCalendar ? setHideCalendar(false) : null
        // setDeliveryZone(delData.delivery.delivery_zone);
        // setMethodData(JSON.parse(JSON.stringify(delData)));

        setFetching(false);
      }
      setCurrentDeliveryPostcode(currentShippingAddress.zip);
    };

    if (selectedMethod === "pickup" && !locationHours) {
      console.log("refreshing PICKUP DATA");
      getPickupDates();
    } else if (selectedMethod !== "pickup" && currentShippingAddress.zip) {
      console.log("refreshing DELIVERY DATA");
      getDeliveryDates();
    }
  }, [selectedMethod]);
  return (
    <>
      {fetching && !minDate ? (
        <Heading>Fetching</Heading>
      ) : (
        <>
          {selectedMethod !== "pickup" && deliveryData && (
            <DeliveryToggle
              deliveryType={deliveryType}
              setDeliveryType={setDeliveryType}
              setCartLineAttr={setCartLineAttr}
              deliveryData={deliveryData}
              availableMethods={{
                shipping: true,
                delivery: true,
                pickup: "true",
              }}
              cart={cart}
              setBlackoutDates={setBlackoutDates}
              changeAttributes={changeAttributes}
              attributes={attributes}
              setMinDate={setMinDate}
            />
          )}
          <Calendar
            minDate={minDate}
            blackoutDates={blackoutDates}
            locationHours={locationHours}
            locationDescription={locationDescription}
            selectedMethod={selectedMethod}
            changeAttributes={changeAttributes}
            delDate={delDate}
          />
        </>
      )}
    </>
  );
};

export default DateSelect;
