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
import { format, getDay } from "date-fns";

const DateSelect = ({
  attributes,
  currentShippingAddress,
  checkoutData,
  cart,
  appMeta,
  url,
  handleMethodSelect,
  setCartLineAttr,
  availableMethods,
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
  

  const [hideCalendar, setHideCalendar] = useState(false);

  const [pickupLocationInfo, setPickupLocationInfo] = useState(null);

  useEffect(() => {
    console.log("method data from date select: ", methodData);
  }, [methodData]);

  useEffect(() => {
    console.log("ADDRESS CHANGE: ", currentShippingAddress);
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

      let targetLocation = checkoutData.pickup.qCollectLocations.filter(
        (location) => {
          return location.id === parseInt(attributes["Pickup-Location-Id"]);
        }
      );

      // .map((filteredLocation) => {
      //   return {
      //     is_locker:
      //       filteredLocation.custom_attribute_1 === "lockers" ? true : false,
      //   };
      // });


      // ? metadata is refetched every time a new postcode is entered


      let targethandle = targetLocation[0].company_name
        .toLowerCase()
        .replaceAll(/\s?[$&+,:;=?@#|'<>.^*()%!-]/gm, "")
        .replaceAll(/\s/gm, "-");

      let {
        data: { metaobject },
      } = await query(
        `
                {
                  metaobject(
                    handle: {type: "store_location", handle: "${targethandle}"}
                  ) {
                    location_type: field(key: "store_type") {
                      value
                    }
                    zapiet_id: field(key: "zapiet_location_id") {
                      value
                    }
                    description: field(key: "description") {
                      value
                    }
                    opening_hours: field(key: "opening_time") {
                      references(first: 50) {
                        nodes {
                          ... on Metaobject {
                            fields {
                              key
                              value
                            }
                          }
                        }
                      }
                    }
                  }
                }
                
                
                `
      );

      let minDay = format(
        getDay(new Date(data.minDate)) + 1,
        "EEEE"
      ).toLowerCase();

      const {
        opening_hours: {
          references: {
            nodes: [{ fields: times }],
          },
        },
      } = metaobject;

      const locHours = times.reduce(
        (obj, item) => ({
          ...obj,
          [item.key]: item.value,
        }),
        {}
      );

      console.log(
        "HERE IS THE TARGET LOCATION: ",
        targetLocation,
        minDay,
        locHours
      );

      let x = {
        id: targetLocation[0].id,
        is_locker:
          targetLocation[0].custom_attribute_1 === "lockers" ? true : false,
        store_hours: locHours
      };
      setPickupLocationInfo(x);
      setMethodData(data);
      setBlackoutDates(data.blackout_dates);
      setMinDate(data.minDate);
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
        availableMethods.shipping === false
      ) {
        await setCartLineAttr({
          type: "updateCartLine",
          id: cart[0].id,
          attributes: [
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
            {
              key: "_deliveryID",
              value: `D%${dz}`,
            },
          ],
        }),
          setDeliveryType("driver-delivery");
        // dz
        //   ? await setCartLineAttr({
        //       type: "updateCartLine",
        //       id: cart[0].id,
        //       attributes: [
        //         {
        //           key: "_deliveryID",
        //           value: `${attributes["Checkout-Method"]
        //             .charAt(0)
        //             .toUpperCase()}%${dz}`,
        //         },
        //       ],
        //     })
        //   : null;

        setBlackoutDates(delData.delivery.blackouts);
        setMinDate(delData.delivery.min_date);
      }

      if (
        delData.delivery.delivery_zone === "unavailable" &&
        availableMethods.shipping === true
      ) {
        await setCartLineAttr({
          type: "updateCartLine",
          id: cart[0].id,
          attributes: [
            {
              key: "_deliveryID",
              value: `S`,
            },
          ],
        }),
          setDeliveryType("postal");
        setBlackoutDates(delData.shipping.blackouts);
        setMinDate(delData.shipping.min_date);
      }

      // hideCalendar ? setHideCalendar(false) : null
      setDeliveryZone(delData.delivery.delivery_zone);
      setMethodData(JSON.parse(JSON.stringify(delData)));
    };

    if (
      attributes["Checkout-Method"] === "pickup"
      //&&      currentShippingAddress !== ""
    ) {
      console.log("refreshing PICKUP DATA");
      getPickupDates();
    } else if (
      attributes["Checkout-Method"] === "delivery"
      //&& currentShippingAddress !== ""
    ) {
      console.log("refreshing DELIVERY DATA");
      getDeliveryDates();
    }
  }, [currentShippingAddress.zip]);

  return (
    <View>
      {!!minDate && methodData && (
        <>
          {attributes["Checkout-Method"] === "delivery" && (
            <DeliveryTypeSelect
              setDeliveryType={setDeliveryType}
              deliveryType={deliveryType}
              setCartLineAttr={setCartLineAttr}
              methodData={methodData}
              availableMethods={availableMethods}
              cart={cart}
              setBlackoutDates={setBlackoutDates}
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
          />
        </>
      )}

      {!minDate && methodData && (
        <DeliveryEmptyState handleMethodSelect={handleMethodSelect} />
      )}
      {!methodData &&
        `${
          attributes["Checkout-Method"] === "pickup"
            ? "GETTING PICKUP DATES"
            : "GETTING DELIVERY DATES"
        }`}
    </View>
  );
};

export default DateSelect;

// return (
//   <View>
//     {!!methodData && (
//       <>
//         {attributes["Checkout-Method"] === "delivery" &&
//         cart[0].attributes[0].value === "U" ? (
//           <DeliveryEmptyState
//             handleMethodSelect={handleMethodSelect}
//             rate={cart[0].attributes[0].value}
//           />
//         ) : (
//           <>
//             {attributes["Checkout-Method"] === "delivery" && (
//               <DeliveryTypeSelect
//                 setDeliveryType={setDeliveryType}
//                 deliveryType={deliveryType}
//                 setCartLineAttr={setCartLineAttr}
//                 methodData={methodData}
//                 availableMethods={availableMethods}
//               />
//             )}
//             <AltCalendar
//               rate={cart[0].attributes[0].value}
//               methodData={methodData}
//               attributes={attributes}
//               deliveryType={deliveryType}
//             />
//           </>
//         )}
//       </>
//     )}
//     {!methodData &&
//       `${
//         attributes["Checkout-Method"] === "pickup"
//           ? "GETTING PICKUP DATES"
//           : "GETTING DELIVERY DATES"
//       }`}
//   </View>
// );
// };
