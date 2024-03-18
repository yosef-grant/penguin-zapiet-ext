import { reactExtension } from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

import MethodSelect from "./Components/MethodSelect/MethodSelect.jsx";
import DatePicker from "./Components/DatePicker/DatePicker.jsx";
import LineItemProps from "./Components/LineItemProps/LineItemProps.jsx";
import ExtendedCheckoutSummary from "./Components/ExtendedCheckoutSummary/ExtendedCheckoutSummary.jsx";
import CustomerNotes from "./Components/DatePicker/CustomerNotes.jsx";
import DeliveryRatesInfo from "./Components/DeliveryRatesInfo/DeliveryRatesInfo.jsx";
import CollectionBillingWarning from "./Components/CollectionBillingWarning/CollectionBillingWarning.jsx";

const url = "https://southeast-featured-clearing-hwy.trycloudflare.com/";

// ? can attributes be traced here, 'outside' the extensions themselves?

const MethodSelectExt = reactExtension(
  "purchase.checkout.contact.render-after",
  () => <MethodSelect url={url} />
);
const DatePickerExt = reactExtension(
  "purchase.checkout.shipping-option-list.render-before",
  () => <DatePicker url={url} />
);
const DeliveryRatesInfoExt = reactExtension(
  "purchase.checkout.shipping-option-item.details.render",
  () => <DeliveryRatesInfo url={url} />
);

const LineItemPropsExt = reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <LineItemProps />
);
const ExtendedCheckoutSummaryExt = reactExtension(
  "purchase.checkout.cart-line-list.render-after",
  () => <ExtendedCheckoutSummary />
);
const CollectionBillingWarningExt = reactExtension(
  "purchase.checkout.payment-method-list.render-after",
  () => <CollectionBillingWarning />
);

export {
  MethodSelectExt,
  DatePickerExt,
  DeliveryRatesInfoExt,
  LineItemPropsExt,
  ExtendedCheckoutSummaryExt,
  CollectionBillingWarningExt
};
