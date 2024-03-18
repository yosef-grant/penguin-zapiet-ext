import { reactExtension } from "@shopify/ui-extensions-react/checkout";
import LoveClub from "./Components/LoveClub/LoveClub.jsx";
import ThankYouLineItemProps from "./Components/ThankYouLineItemProps/ThankYouLineItemProps.jsx";
import MainBody from "./Components/MainBody/MainBody.jsx";

const url = "https://southeast-featured-clearing-hwy.trycloudflare.com/";



const MainBodyExt = reactExtension("purchase.thank-you.block.render", () => (
  <MainBody url={url} />
));
const ThankYouLineItemPropsExt = reactExtension(
  "purchase.thank-you.cart-line-item.render-after",
  () => <ThankYouLineItemProps />
);
const LoveClubExt = reactExtension(
  "purchase.thank-you.cart-line-list.render-after",
  () => <LoveClub />
);

export { MainBodyExt, ThankYouLineItemPropsExt, LoveClubExt };
