import {
  Heading,
  View,
  reactExtension,
  useDeliveryGroups,
} from "@shopify/ui-extensions-react/checkout";


// export default reactExtension(
//   "purchase.checkout.shipping-option-list.render-after",
//   () => <ShippingPanel />
// );

const ShippingPanel = () => {
  const deliveryGroups = useDeliveryGroups();

  console.log("______________ ", deliveryGroups);
  return (
    deliveryGroups &&
    deliveryGroups[0]?.deliveryOptions && (
      <>
        <Heading>Here's the shipping section</Heading>
        {deliveryGroups[0].deliveryOptions.map((group) => (
          <View key={group.handle}>
            <Heading>{group.title}</Heading>
          </View>
        ))}
      </>
    )
  );
};
