import {
  Heading,
  TextBlock,
  useApi,
  useShippingOptionTarget,
  View,
} from "@shopify/ui-extensions-react/checkout";
import React, { useEffect, useState } from "react";

const RateProperties = () => {
  const { query } = useApi();

  const currentShippingOption = useShippingOptionTarget();

  const [rates, setRates] = useState(null);
  const [currentRateInfo, setCurrentRateInfo] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        let {
          data: {
            metaobjects: { edges: rates },
          },
        } = await query(
          `
            {
                metaobjects(type: "zone_slot", first: 10){
                  edges {
                    node {
                    title: field(key: "rate_title") {
                        value
                      }
                    description: field(key: "delivery_description") {
                        value
                    }
                    time: field(key: "time") {
                        value
                    }
                    
                    }
                  }
                }
              }
            `
        );

        console.log("heres the METAOBJECTS: ", rates);
        let currentRate = currentShippingOption.shippingOptionTarget.title;
        let y = rates.filter((rate) => {
          console.table(rate.node);
          console.log(
            "currentShippingOption: ",
            currentShippingOption.shippingOptionTarget.title
          );
          return (
            currentShippingOption.shippingOptionTarget.title.includes(
              rate.node.time.value
            ) && rate.node.title.value !== "Store Collection"
          );
        });
        console.log("Y from useEffect: ", y);
        setCurrentRateInfo({
          description: y[0].node.description.value,
        });

        setRates(rates);
      } catch (error) {
        console.log("error fetching metaobject data in rates!");
      }
    };
    getData();
  }, []);

  const getRateDescription = () => {
    let y = rates.filter((rate) => {
      console.table(rate.node);
      console.log(
        "currentShippingOption: ",
        currentShippingOption.shippingOptionTarget.title
      );
      return (
        currentShippingOption.shippingOptionTarget.title.includes(
          rate.node.time.value
        ) && rate.node.title !== "Store Collection"
      );
    });

    let x = rates
      .filter((rate) => {
        return (
          currentShippingOption.shippingOptionTarget.title.includes(
            rate.node.time.value
          ) && rate.node.title !== "Store Collection"
        );
      })
      .map((filteredRate) => {
        return filteredRate.node.description.value;
      });
    console.log(
      "rate title: ",
      currentShippingOption.shippingOptionTarget.title,
      "\nheres x: ",
      x,
      "\nHeres Y: ",
      y
    );
    return x[0] ? x[0] : "temp";
  };

  return (
    <>
      {currentRateInfo && currentShippingOption && (
        <View>
          <TextBlock>{currentRateInfo.description}</TextBlock>
        </View>
      )}
    </>
  );
};

export default RateProperties;
