import {
  SkeletonTextBlock,
  useApi,
  useApplyAttributeChange,
  useApplyShippingAddressChange,
  useAttributeValues,
  useStorage,
  ScrollView,
  View,
  Pressable,
  BlockStack,
  ChoiceList,
  Choice,
} from "@shopify/ui-extensions-react/checkout";
import { Select, Heading } from "@shopify/ui-extensions/checkout";
import { format, getDay } from "date-fns";
import { useState, useEffect } from "react";

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
  pathway,
  disabled,
}) => {
  useEffect(() => {
    console.log("£££££££££££££££ ", checkoutData);
  }, [checkoutData]);

  const [loading, setLoading] = useState(false);

  let changeAttributes = useApplyAttributeChange();
  let changeShippingAddress = useApplyShippingAddressChange();

  let savedPath = useAttributeValues(["buyer-pathway"]);

  const { query } = useApi();

  const handleLocationSelect = async (val) => {
    console.log("llllllllllllllllllllll ", checkoutData);
    setLoading(true);

    if (pathway === "quick-collect") {
      await changeAttributes({
        type: "updateAttribute",
        key: "buyer-pathway",
        value: "quick-collect",
      });
    }

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
    setLoading(false);
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

  const handleChange = () => {
    console.log("new location chosen!")
  }
  return !loading ? (
    <>
      {/* <Select
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
      disabled={pathway === "quick-collect" && disabled ? true : false}
      /> */}
      <ScrollView
        maxBlockSize={450}
        hint={{ type: "pill", content: "Scroll for more options" }}
        direction="block"
      >
        <ChoiceList 
        name="select location"
        value={""}
        onChange={() => handleChange()}
        >
          <BlockStack>
            {locations.map((location, i) => (
              <Choice id={i}>{location.company_name}</Choice>
            ))}
          </BlockStack>
        </ChoiceList>
        {/* {locations.map((location) => (
          <View border="base" >
            <Pressable accessibilityRole="button" blockAlignment={"center"} minInlineSize={`${99}%`} minBlockSize={75}>
              {location.company_name}
            </Pressable>
          </View>
        ))} */}
      </ScrollView>
    </>
  ) : (
    <SkeletonTextBlock lines={1} textSize="large" />
  );
};

export default LocationsSelect;
