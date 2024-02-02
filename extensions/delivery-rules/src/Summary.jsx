import React, { useEffect, useState } from "react";
import {
  Button,
  Disclosure,
  Divider,
  Heading,
  Text,
  View,
  useApplyAttributeChange,
  useAttributes,
  useDeliveryGroups,
  useShippingAddress,
  useStorage,
  List,
  ListItem,
} from "@shopify/ui-extensions-react/checkout";

import currency from "./helpers/Currency.jsx";
import { format } from "date-fns";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const dateFormat = "do MMM yyyy";

const Summary = () => {
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [storedData, setStoredData] = useState(null);
  const delGroups = useDeliveryGroups();
  const localStorage = useStorage();

  const changeAttributes = useApplyAttributeChange();

  const attr = useAttributes();
  const cartAddress = useShippingAddress();
  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  useEffect(() => {
    const updateStoredData = async () => {
      console.log("updating stored data in summary");
      const data = await localStorage.read("selected_location_info");
      setStoredData(data);
    };
    updateStoredData();
  }, [cartAddress.zip]);

  useEffect(() => {
    const setDeliveryAttributes = async () => {
      let rates = delGroups[0].deliveryOptions;
      let currentRateHandle = delGroups[0].selectedDeliveryOption.handle;

      let selectedDeliveryOption = rates.filter(
        (rate) => rate.handle === currentRateHandle
      );
      let title = selectedDeliveryOption[0].title;

      let titleRegex = /^\b['\w\s]+\b/;
      let truncTitle = selectedDeliveryOption[0].title.match(titleRegex)[0];

      let price = selectedDeliveryOption[0].costAfterDiscounts.amount * 100;

      console.log("delivery price: ", price);

      let timeRegex = new RegExp(/-\s(.*)\s\(/g);

      const time = timeRegex.exec(title)[1];

      if (attributes["Delivery-Time"] && attributes["Delivery-Time"] === time) {
        return;
      } else {
        await changeAttributes({
          type: "updateAttribute",
          key: "Delivery-Time",
          value: time,
        });
        await changeAttributes({
          type: "updateAttribute",
          key: "Delivery-Price",
          value: `${price}`,
        });
        await changeAttributes({
          type: "updateAttribute",
          key: "Delivery-Title",
          value: truncTitle,
        });
      }
    };
    delGroups.length && attributes["Checkout-Method"] === "delivery"
      ? (console.log("delivery groups updated: ", delGroups),
        setDeliveryAttributes())
      : null;
  }, [delGroups]);

  const capitalise = (str) => {
    let f = str.charAt(0).toUpperCase();
    let r = str.slice(1, str.length);
    console.log("capitalisation: ", f, r);
    return `${f}${r}`;
  };

  console.log("attributes from summary: ", attributes);

  const getOpeningTime = () => {
    let day = format(new Date(attributes["Pickup-Date"]), "EEEE").toLowerCase();
    let openingTime = storedData.hours[`${day}_opening_hours`];

    return openingTime;
  };

  useEffect(() => {
    const initialiseSummary = async () => {
      if (cartAddress.zip && cartAddress.address1 && cartAddress.city) {
        let method =
          attributes["Checkout-Method"] === "pickup"
            ? "Collection"
            : attributes["Checkout-Method"] === "shipping"
            ? "Postal"
            : "Delivery";

        let selected_day_opening_time = null;

        setCheckoutDetails({
          method: method,
          address: `${
            attributes["Checkout-Method"] === "pickup"
              ? attributes["Pickup-Location-Company"] + ", "
              : ""
          }${cartAddress.address1}, ${cartAddress.city}, ${cartAddress.zip}`,
        });
      } else {
        checkoutDetails ? setCheckoutDetails(null) : null;
      }
    };

    initialiseSummary();
  }, [cartAddress, attributes["Checkout-Method"]]);

  useEffect(() => {
    console.log("checkout details changed: ", checkoutDetails);
  }, [checkoutDetails]);

  return (
    <>
      {checkoutDetails?.method && (
        <>
          <Divider />
          <View padding={["base", "none", "base", "none"]}>
            <Heading>{checkoutDetails.method} Address</Heading>
            <Text>{checkoutDetails.address}</Text>
            {attributes[
              `${capitalise(attributes["Checkout-Method"])}-Date`
            ] && (
              // {`${
              //   attributes[capitalise(attributes["Checkout-Method"])]
              // }-Date` !== '' && (
              <>
                <Heading>{checkoutDetails.method} Date</Heading>
                <Text>
                  {format(
                    new Date(
                      attributes[
                        `${capitalise(attributes["Checkout-Method"])}-Date`
                      ]
                    ),
                    dateFormat
                  )}
                </Text>
              </>
            )}
            {attributes["Checkout-Method"] === "delivery" &&
              attributes["Delivery-Title"] &&
              attributes["Delivery-Time"] &&
              attributes["Delivery-Price"] && (
                <>
                  <Heading>{attributes["Delivery-Title"]}</Heading>
                  <Heading>{attributes["Delivery-Time"]}</Heading>
                  <Heading>{currency(attributes["Delivery-Price"])}</Heading>
                </>
              )}
            {attributes["Checkout-Method"] === "pickup" &&
              attributes["Pickup-Date"] &&
              storedData && (
                <>
                  <Heading>{`${attributes["Pickup-Location-Company"]} Opening Times`}</Heading>
                  <Heading>On selected date:</Heading>
                  <Text>{getOpeningTime()}</Text>

                  <View>
                    <Disclosure>
                      <Button toggles="test">See all opening times</Button>
                      <View id="test">
                        <List marker={"none"} spacing="tight">
                          {weekdays.map((weekday, i) => (
                            <ListItem key={`${weekday}${i}`}>
                              <Text size={"base"} emphasis="bold">
                                {`${weekday.slice(0, 3)}: `}
                              </Text>
                              <Text size="base">
                                {
                                  storedData.hours[
                                    `${weekday.toLowerCase()}_opening_hours`
                                  ]
                                }
                              </Text>
                            </ListItem>
                          ))}
                        </List>
                      </View>
                    </Disclosure>
                  </View>
                </>
              )}
          </View>
          <Divider />
        </>
      )}
    </>
  );
};

export default Summary;
