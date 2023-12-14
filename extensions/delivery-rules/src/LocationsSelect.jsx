import {
  useApi,
  useApplyAttributeChange,
  useApplyShippingAddressChange,
  useStorage,
} from "@shopify/ui-extensions-react/checkout";
import { Select, Heading } from "@shopify/ui-extensions/checkout";
import { format, getDay } from "date-fns";
import { useEffect } from "react";

const LocationsSelect = ({
  locations,
  checkoutData,
  setCheckoutData,
  setMinDate,
  nextDay,
  cart,
  setPenguinCart,
  url,
  setSelectedMethod,
  setDisplayCalendar,
}) => {
  useEffect(() => {
    console.log("£££££££££££££££ ", checkoutData);
  }, [checkoutData]);

  let changeAttributes = useApplyAttributeChange();
  let changeShippingAddress = useApplyShippingAddressChange();

  

  const { query } = useApi();

  const storage = useStorage();

  console.log('&&&&&&&&& testing ', storage)


  useEffect(() => {
    const checkStorage = async () => {
      let s = await storage.read("pathway");
      console.log("!!!!!!!!!!!!!!!from quickCollect: ", s);
    };
    checkStorage();
  }, [storage]);


  const handleLocationSelect = async (val) => {
    console.log("llllllllllllllllllllll ", checkoutData);

    await storage.write("pathway", "quick-collect")
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

    let locHours = times.reduce(
      (obj, item) => ({
        ...obj,
        [item.key]: item.value,
      }),
      {}
    );

    console.log(
      ">>>>>>>>>>>> TIMES ",
      times,
      "<<<<<<<<<<<<<<<<< HOURS: ",
      locHours
    );
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

    let locData = await getLocationDates(targetLocation[0]);

    console.log("loc __--^^^--__ data ", locData);
    let x = checkoutData;
    x?.delivery ? null : (x.qCollect = true);
    x.pickup = {
      ...x.pickup,
      selectedLocation: {
        location_hours: locHours,
        location_description: metaobject.description.value,
        dates: locData.dates,
        info: locData.location,
      },
    };

    console.log("#~~::: X", x);
    setCheckoutData(JSON.parse(JSON.stringify(x)));
    getLocationDates(targetLocation[0]);
    setSelectedMethod("pickup");
    setDisplayCalendar(true);
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

    return {
      dates: {
        date: new Date(data.minDate),
        day: getDay(new Date(data.minDate)),
        blackout_dates: data.blackout_dates,
        blackout_days: data.blackout_days,
      },
      location: location,
    };
  };
  return (
    <Select
      label="Choose store or locker"
      value={
        !!checkoutData?.pickup?.selectedLocation
          ? checkoutData.pickup.selectedLocation.info.id
          : ""
      }
      options={locations.map((location) => ({
        value: location.id,
        label: `${location.company_name}${
          !checkoutData.qCollect ? ` - ${location.distance} miles` : ""
        }`,
      }))}
      onChange={(value) => handleLocationSelect(value)}
    />
  );
};

export default LocationsSelect;
