import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  useAttributes,
  View,
  Heading,
  useDeliveryGroups,
  useApplyAttributeChange,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect } from "react";

export default reactExtension(
  "purchase.checkout.cart-line-list.render-after",
  () => <Summary />
);

function Summary() {
  const delGroups = useDeliveryGroups();
  const changeAttributes = useApplyAttributeChange();



  const attr = useAttributes();

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  

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

  console.log("attributes: ", attributes);

  return (
    <View>
      {Object.keys(attributes).map((key) => (
        <Heading>{key}: {attributes[key]}</Heading>
      ))}
    </View>
  );
}
