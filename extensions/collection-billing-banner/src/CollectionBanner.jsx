import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  useAttributes,
  Text,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));


function Extension() {
  const attr = useAttributes();

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  const translate = useTranslate();
  const { extension } = useApi();

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
