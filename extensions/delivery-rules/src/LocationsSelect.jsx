import {
  useApi,
  useApplyAttributeChange,
  useApplyShippingAddressChange,
} from "@shopify/ui-extensions-react/checkout";
import { Select, Heading } from "@shopify/ui-extensions/checkout";
import { format, getDay } from "date-fns";

const LocationsSelect = ({
  locations,
  qCollectLocation,
  isQCollect,
  setQCollectLocation,
  setCheckoutData,
  setMinDate,
  nextDay,
  cart,
  setPenguinCart,
  url,
  collectLocation,
  setCollectLocation,
}) => {
  let changeAttributes = useApplyAttributeChange();

  let changeShippingAddress = useApplyShippingAddressChange();

  const { query } = useApi();

  const handleLocationSelect = async (val) => {
    await changeAttributes({
      type: "updateAttribute",
      key: "Checkout-Method",
      value: "pickup",
    });
    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Location-Id",
      value: val,
    });

    console.log("this is the id of the selected location! ", val);

    let targetLocation = locations.filter(
      (location) => location.id === parseInt(val)
    );
    let targetLocationAddr = targetLocation.map((filteredLocation) => {
      return {
        address1: filteredLocation.address_line_1,
        city: filteredLocation.city,
        zip: filteredLocation.postal_code,
      };
    });

    let locationHandle = targetLocation[0].company_name
      .toLowerCase()
      .replaceAll(/\s?[$&+,:;=?@#|'<>.^*()%!-]/gm, "")
      .replaceAll(/\s/gm, "-");

    console.log(";;;;;;;;;;;;;;;;;;; locationHandle ", locationHandle);

    let {
      data: { metaobject },
    } = await query(
      `
          {
            metaobject(
              handle: {type: "store_location", handle: "${locationHandle}"}
            ) {
              location_type: field(key: "store_type") {
                value
              }
              zapiet_id: field(key: "zapiet_location_id") {
                value
              }
              description: field(key: "description") {
                value
              }
              opening_hours: field(key: "opening_time") {
                references(first: 50) {
                  nodes {
                    ... on Metaobject {
                      fields {
                        key
                        value
                      }
                    }
                  }
                }
              }
            }
          }
          
          
          `
    );

    console.log("|||||||||||||||||||| data: ", metaobject);

    const {
      opening_hours: {
        references: {
          nodes: [{ fields: times }],
        },
      },
    } = metaobject;

    let x = times.reduce(
      (obj, item) => ({
        ...obj,
        [item.key]: item.value,
      }),
      {}
    );

    console.log(">>>>>>>>>>>> TIMES ", times, "<<<<<<<<<<<<<<<<< X: ", x);
    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Location-Company",
      value: targetLocation[0].company_name,
    });
    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Location-Type",
      value: targetLocation[0].custom_attribute_1,
    });
    await changeShippingAddress({
      type: "updateShippingAddress",
      address: targetLocationAddr[0],
    });
    setCheckoutData((checkoutData) => {
      return {
        ...checkoutData,
        location_hours: x,
        location_description: metaobject.description.value,
      };
    });
    getLocationDates(targetLocation[0]);
    isQCollect
      ? setQCollectLocation(targetLocation[0])
      : setCollectLocation(targetLocation[0]);
  };

  const getLocationDates = async (location) => {
    console.log("heres the location: ", location);
    let resBody = {
      cart: cart,
      locationId: location.id,
      locationType: location.custom_attribute_1,
      twoDayDelivery: nextDay,
    };
    let res = await fetch(`${url}/pza/pickup-dates-test`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(resBody),
    });
    let data = await res.json();
    console.log(
      "================================= dates for pickup location!",
      data,
      "\n",
      resBody
    );
    data?.cartInfo
      ? (console.log("penguin location was selected!"),
        setPenguinCart(data.cartInfo))
      : null;
    setMinDate(new Date(data.minDate));
    setCheckoutData((checkoutData) => {
      return {
        ...checkoutData,
        checkout_date: {
          date: new Date(data.minDate),
          day: getDay(new Date(data.minDate)),
        },
      };
    });
  };
  return (
    <>
      <Select
        label="Choose store or locker"
        value={
          isQCollect && qCollectLocation
            ? qCollectLocation.id
            : !isQCollect && collectLocation
            ? collectLocation.id
            : ""
        }
        options={locations.map((location) => ({
          value: location.id,
          label: `${location.company_name}${
            !isQCollect ? ` - ${location.distance} miles`  : ""
          }`,
        }))}
        onChange={(value) => handleLocationSelect(value)}
      />
    </>
  );
};

export default LocationsSelect;
