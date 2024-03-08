import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  useAppMetafields,
  View,
  Text,
  Divider,
  Image,
  InlineLayout,
  BlockLayout,
  useCustomer,
} from "@shopify/ui-extensions-react/checkout";

import currency from "../../helpers/Currency.jsx";

const LCIcon =
  "https://cdn.shopify.com/s/files/1/0575/1468/8647/files/LoveClubThankYouIcon.svg?v=1709720886";

const LoveClub = () => {
  const appMeta = useAppMetafields();
  const customer = useCustomer();

  const points =
    customer && appMeta
      ? parseInt(
          appMeta
            .filter((meta) => meta.target.type === "customer")
            .map((filteredMeta) => filteredMeta.metafield.value)[0]
        )
      : null;

  console.log(
    "this is app meta from loveclub: ",
    appMeta,
    parseInt(
      appMeta
        .filter((meta) => meta.target.type === "customer")
        .map((filteredMeta) => filteredMeta.metafield.value)[0]
    )
  );

  return customer && points ? (
    <View>
      <Divider size="base" />
      <InlineLayout
        padding={["base", "none", "base", "none"]}
        blockAlignment={"center"}
      >
        <Image source={LCIcon} />
        <BlockLayout
          blockAlignment={"start"}
          inlineAlignment={"end"}
          spacing={"extraTight"}
          rows={"auto"}
        >
          <Text emphasis="bold">Your Love Club points</Text>
          <InlineLayout
            spacing={"tight"}
            inlineAlignment={"end"}
            blockAlignment={"center"}
          >
            <Text emphasis="bold" size={"large"}>
              {points}
            </Text>
            <Text>{`(${currency(points)})`}</Text>
          </InlineLayout>
        </BlockLayout>
      </InlineLayout>
      <Divider size="base" />
    </View>
  ) : null;
};

export default LoveClub;
