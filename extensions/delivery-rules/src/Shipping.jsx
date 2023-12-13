import {
  Heading,
  View,
  reactExtension,
  useDeliveryGroups,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension(
  "purchase.checkout.shipping-option-list.render-after",
  () => <ShippingPanel />
);

const ShippingPanel = () => {
  const deliveryGroups = useDeliveryGroups();

  console.log("______________ ", deliveryGroups);
  return (
    <>
      <Heading>Here's the shipping section</Heading>
      {deliveryGroups[0].deliveryOptions.map((group) => (
        <View>
          <Heading>{group.title}</Heading>
        </View>
      ))}
    </>
  );
};
