import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  useAttributeValues,
  useCartLines,
  useAttributes,
  useShippingOptionTarget,
  Text,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

function DeliveryRatesInfo() {
  const { query } = useApi();

  const cart = useCartLines();

  console.log(cart);

  const shippingTarget = useShippingOptionTarget();

  const [rateInfo, setRateInfo] = useState(null);
  const [rateDescription, setRateDescription] = useState(null);
  const attr = useAttributes();

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  console.log(JSON.stringify(cart[0].attributes));
  useEffect(() => {
    console.log("FETCHING RATES");
    const getRateInfo = async () => {
      const {
        data: {
          metaobjects: { edges: data },
        },
      } = await query(
        `
          {
            metaobjects(type: "delivery_zone", first: 15){
              edges{
                node{
                  handle
                  field(key: "delivery_slot") {
                    
                    references (first: 10)  {
                      nodes{
                        # Check metafield references ONLY
                        ...on Metaobject {
                          title: field(key : "rate_title") {
                            value
                          }
                          price: field(key : "price") {
                            value
                          }
                          time: field(key : "time") {
                            value
                          }
                          description:field(key: "delivery_description") {
                            value
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
      `
      );
      let t = data
        .filter(
          (rate) =>
            rate.node.handle.includes("zone") &&
            !rate.node.handle.includes("postal")
        )
        .reduce((acc, filteredRate) => {
          acc[filteredRate.node.handle] =
            filteredRate.node.field.references.nodes;
          return acc;
        }, {});
      console.log("INFO ON RATES: ", t);
      setRateInfo(t);
    };

    getRateInfo();
    // attributes['Checkout-Method'] === 'delivery'
    //   ? getRateInfo()
    //   : rateInfo
    //   ? setRateInfo(null)
    //   : null;
  }, []);

  const getRateDescription = () => {
    let delZone = cart[0].attributes
      .filter((attribute) => attribute.key === "_deliveryID")
      .map((filteredVal) => {
        return filteredVal.value;
      })
      .join("")
      .charAt(2);

    if (delZone) {
      let shippingTargetTitle = shippingTarget.shippingOptionTarget.title;

      let targetRateGroup = rateInfo[`zone-${delZone}`];

      console.log(
        "heres the currently selected rate: ",
        shippingTargetTitle,
        "\nheres the related group: ",
        targetRateGroup
      );
      let t = targetRateGroup.filter(
        (rate) =>
          shippingTargetTitle && shippingTargetTitle.includes(rate.time.value)
      );

      console.log("heres t from function: ", t[0]);

      return t[0] ? t[0].description.value : null;
    } else {
      return;
    }
  };

  return rateInfo && attributes["Checkout-Method"] === "delivery" ? (
    <Text>{getRateDescription()}</Text>
  ) : null;
}

export default DeliveryRatesInfo;
