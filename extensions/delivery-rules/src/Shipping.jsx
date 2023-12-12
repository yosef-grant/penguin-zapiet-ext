import { Heading, reactExtension, useDeliveryGroups } from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.shipping-option-list.render-after", () => (
    <ShippingPanel />
  ));
  

const ShippingPanel = () => {

    const deliveryGroups = useDeliveryGroups();

    console.log('______________ ', deliveryGroups);
    return (
        <Heading>Here's the shipping section</Heading>
    )
}