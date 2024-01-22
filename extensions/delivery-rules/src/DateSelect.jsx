import { View } from "@shopify/ui-extensions-react/checkout";
import React, { useEffect, useState } from "react";
import AltCalendar from "./AltCalendar.jsx";

const DateSelect = ({
  attributes,
  currentShippingAddress,
  checkoutData,
  cart,
  appMeta,
  url,
  setCartLineAttr,
}) => {
  console.log(
    "current attributes: ",
    attributes,
    currentShippingAddress,
    checkoutData
  );

  const [methodData, setMethodData] = useState(null);

  useEffect(() => {
    const getPickupDates = async () => {
      let nextDayMeta = appMeta.map((meta) => {
        return JSON.parse(meta.metafield.value).next_day_delivery.value;
      });
      let nextDay =
        nextDayMeta.includes(1) || nextDayMeta.includes(null) ? true : false;

      // let selectedLocation = checkoutData.pickup.qCollectLocations.filter(location => {
      //   return location.postal_code === currentShippingAddress.zip
      // })

      console.log(
        "*&*& current location from date selection: ",
        attributes["Pickup-Location-Id"],
        nextDay,
        attributes["Pickup-Location-Type"]
      );

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

      setMethodData(data);
    };

    const getDeliveryDates = async () => {
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

      console.log("\n Postcode availability data: ", delData);

      let dz =
        attributes["Checkout-Method"] === "delivery"
          ? delData.delivery.delivery_zone.replace(/[^0-9.]/g, "")
          : null;

      dz
        ? await setCartLineAttr({
            type: "updateCartLine",
            id: cart[0].id,
            attributes: [
              {
                key: "_deliveryID",
                value: `${attributes["Checkout-Method"]
                  .charAt(0)
                  .toUpperCase()}%${dz}`,
              },
            ],
          })
        : null;

      setMethodData(delData);
    };
    if (
      attributes["Checkout-Method"] === "pickup" &&
      currentShippingAddress !== ""
    ) {
      getPickupDates();
    } else if (
      attributes["Checkout-Method"] === "delivery" &&
      currentShippingAddress !== ""
    ) {
      getDeliveryDates();
    }
  }, [currentShippingAddress]);

  return (
    <View>
      {methodData ? (
     
        <AltCalendar methodData={methodData} attributes={attributes}/>
  
      ) : (
        `${
          attributes["Checkout-Method"] === "pickup"
            ? "GETTING PICKUP DATES"
            : "GETTING DELIVERY DATES"
        }`
      )}
    </View>
  );
};

export default DateSelect;
