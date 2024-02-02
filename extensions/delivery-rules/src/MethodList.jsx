import React, { useState } from "react";
import icons from "./MethodIcons.jsx";
import { capitalise } from "./helpers/StringFunctions.jsx";
import {
  Grid,
  Image,
  Pressable,
  useApplyAttributeChange,
  useApplyCartLinesChange,
  useAttributes,
  useCartLines,
} from "@shopify/ui-extensions-react/checkout";

const MethodList = ({
  availableMethods,
  selectedMethod,
  setFetching,
  setSelectedMethod,
  checkoutData,
  reserveTime,
  setReserveTime,
  setDisplayCalendar,
  setMinDate,
}) => {
  const [hover, setHover] = useState(null);

  const setCartLineAttr = useApplyCartLinesChange();
  const changeAttributes = useApplyAttributeChange();
  const cartLines = useCartLines();
  const attr = useAttributes();

  const attrList = attr.reduce(
    (obj, item) => ({
      ...obj,
      [item.key]: item.value,
    }),
    {}
  );

  const checkNullDelivery = (data) => {
    return (data === "delivery" &&
      checkoutData.delivery.delivery_zone.trim().toLowerCase() ===
        "unavailable") ||
      !availableMethods[data]
      ? true
      : false;
  };

  const handleMethodSelect = async (method) => {
    if (method !== selectedMethod) {
      setFetching(true);
      // console.log('heres data from method select: ', checkoutData);
      reserveTime?.expiry ? setReserveTime({}) : null;

      setSelectedMethod(method);
      setDisplayCalendar(false);
      method !== "pickup" ? setSelectedMethod(method) : null;
      method !== "pickup" ? setMinDate(checkoutData[method].min_date) : null;

      let dz =
        method === "delivery"
          ? checkoutData.delivery.delivery_zone.replace(/[^0-9.]/g, "")
          : null;

      // console.log('THE DZ ', dz, method);
      await setCartLineAttr({
        type: "updateCartLine",
        id: cartLines[0].id,
        attributes: [
          {
            key: "_deliveryID",
            value: dz
              ? `${method.charAt(0).toUpperCase()}%${dz}`
              : method.charAt(0).toUpperCase(),
          },
        ],
      });
      Object.keys(attrList).forEach(async (key) => {
        // console.log('UUU ', key);

        await changeAttributes({
          type: "updateAttribute",
          key: "Checkout-Method",
          value: method,
        });
        if (
          key !== "Lolas-CS-Member" &&
          key !== "Customer-Service-Note" &&
          key !== "buyer-pathway" &&
          key !== "Checkout-Method"
        ) {
          // TODO strange behaviour when coming from pickup --> delivery; PM time remains in attr

          await changeAttributes({
            type: "updateAttribute",
            key: key,
            value: "",
          });
        }
        if (method !== "pickup") {
          await changeAttributes({
            type: "updateAttribute",
            key: `${capitalise(method)}-Date`,
            value: checkoutData[method].min_date,
          });
        }
      });
    }
  };

  return (
    <Grid
      columns={["fill", "fill", "fill"]}
      rows={["auto"]}
      spacing="loose"
      padding={["base", "none", "base", "none"]}
    >
      {Object.keys(availableMethods).map((key, i) => (
        <Pressable
          key={`${key}${i}`}
          disabled={checkNullDelivery(key)}
          onPress={() => handleMethodSelect(key)}
          onPointerEnter={() => setHover(key)}
          onPointerLeave={() => setHover(null)}
        >
          <Image
            source={
              checkNullDelivery(key)
                ? icons[key].disabled
                : selectedMethod === key
                ? icons[key].selected
                : hover === key
                ? icons[key].hover
                : icons[key].default
            }
          />
        </Pressable>
      ))}
    </Grid>
  );
};

export default MethodList;
