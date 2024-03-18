import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  useAttributes,
  Text,
  useShippingAddress,
  useBillingAddress,
  useBuyerJourneyIntercept,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";
import LockerCountdownAux from "./LockerCountdownAux.jsx";


function CollectionBillingWarning() {
  const attr = useAttributes();

  const shippingAddress = JSON.stringify(useShippingAddress());
  const billingAddress = JSON.stringify(useBillingAddress());

  const [match, setMatch] = useState(true);
  const [blockUser, setBlockUser] = useState(false);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    return canBlockProgress && match
      ? {
          behavior: "block",
          reason:
            "Billing Address and Shipping address cannot match for Collection",
          perform: (result) => {
            result.behavior === "block" ? setBlockUser(true) : null;
          },
        }
      : {
          behavior: "allow",
          perform: () => {
            blockUser ? setBlockUser(false) : null;
          },
        };
  });

  console.log(
    "heres the shipping address: ",
    shippingAddress,
    "\nHeres the billing address: ",
    billingAddress,
    "\n Do they Match? ",
    shippingAddress === billingAddress
  );

  useEffect(() => {
    blockUser ? setBlockUser(false) : null;
    shippingAddress === billingAddress ? setMatch(true) : setMatch(false);
  }, [billingAddress]);

  const attributes = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  return (
    <>
      <LockerCountdownAux />
      {blockUser ? (
        <>
          // * Should only show if two addresses match
          <Banner title="Address Warning">
            <Text>Billing Address cannot match Collection Address</Text>
          </Banner>
        </>
      ) : null}
      ;
    </>
  );
}

export default CollectionBillingWarning;
