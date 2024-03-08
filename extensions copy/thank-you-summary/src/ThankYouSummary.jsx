import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.thank-you.cart-line-item.render-after',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();

  return (
    <Banner title="Thank You Summary">
      {translate('welcome', {target: extension.target})}
    </Banner>
  );
}