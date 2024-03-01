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

export default reactExtension(
  "purchase.checkout.shipping-option-item.details.render",
  () => <Extension />
);

function Extension() {

  const { query } = useApi();

  const cart = useCartLines();

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


  console.log('FROM RATES DESC: ', JSON.stringify(cart[0].attributes));
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (
      cart[0].attributes.filter(
        (attribute) => attribute.key === "_deliveryID"
      ) &&
      attributes["Checkout-Method"] === "delivery" &&
      rateInfo
    ) {
      let delZone = cart[0].attributes
        .filter((attribute) => attribute.key === "_deliveryID")
        .map((filteredVal) => {
          return filteredVal.value;
        })
        .join("")
        .charAt(2);
        let shippingTargetTitle = shippingTarget.shippingOptionTarget.title;

      let targetRateGroup = rateInfo[`zone-${delZone}`];
      let t = targetRateGroup.filter(rate => shippingTargetTitle.includes(rate.time.value));

      // console.log(
      //   "cart has a delivery zone! ",
      //   delZone,
      //   rateInfo,
      //   targetRateGroup,
      //   t,
      //   shippingTargetTitle,
      //   t[0].description
      // );
      t ? setRateDescription(t[0].description.value) : null;
    }
  }, [rateInfo, cart]);



  return (
    <>
      {rateDescription && shippingTarget.isTargetSelected &&
         <Text>{rateDescription}</Text>
        }
    </>
  );
}

