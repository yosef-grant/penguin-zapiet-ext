import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  useAppMetafields,
  View,
  Text,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.thank-you.cart-line-list.render-after',
  () => <Extension />,
);

function Extension() {

  const appMeta = useAppMetafields();

  console.log('this is app meta from loveclub: ', appMeta);

  
  
  const translate = useTranslate();
  const { extension } = useApi();

  return (
    <View>
      <Text>
        Your points balance: {parseInt(appMeta.filter(meta => meta.target.type === "customer").map(filteredMeta => filteredMeta.metafield.value)[0])}
      </Text>
    </View>
  );
}