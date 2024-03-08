import {
    Banner,
    useApi,
    useTranslate,
    reactExtension,
    useAttributes,
    Text,
  } from "@shopify/ui-extensions-react/checkout";
  

  
  function CollectionBillingWarning() {
    const attr = useAttributes();
  
    const attributes = attr.reduce(
      (obj, item) => ({
        ...obj,
        [item.key]: item.value,
      }),
      {}
    );
  

    return (
      <>
        {attributes["Checkout-Method"] === "pickup" && (
          <Banner title="Enter Billing Address">
            <Text>Don't forget to provide your billing address below</Text>
          </Banner>
        )}
      </>
    );
  }

  export default CollectionBillingWarning;
  