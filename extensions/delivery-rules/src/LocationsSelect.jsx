import {
  SkeletonTextBlock,
  useApi,
  useApplyAttributeChange,
  useApplyShippingAddressChange,
  useAttributeValues,
  useStorage,
  ScrollView,
  SkeletonImage,
  View,
  Pressable,
  BlockStack,
  InlineLayout,
  InlineSpacer,
  ChoiceList,
  Choice,
  Spinner,
  Image,
  Text,
  TextBlock,
  Button,
} from "@shopify/ui-extensions-react/checkout";
import LocationFilters from "./LocationFilters.jsx";
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
  const [scrollPos, setScrollPos] = useState(null);

  const [filters, setFilters] = useState(["stores", "lockers"]);

  let changeAttributes = useApplyAttributeChange();
  let changeShippingAddress = useApplyShippingAddressChange();

  let savedPath = useAttributeValues(["buyer-pathway"]);

  const { query } = useApi();

  const handleLocationSelect = async (val) => {
    console.log(
      "llllllllllllllllllllll ",
      checkoutData,
      "\n",
      "choice val: ",
      val
    );

    setDisplayCalendar((displayCalender) => {
      return displayCalender ? false : null;
    });
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
    console.log("new location chosen!");
  };

  const handleScroll = (posVal) => {
    setScrollPos(posVal.position.block);
  };

  const getFilteredLocations = () => {
    let fLocations;
    if (filters.length === 2) {
      fLocations = locations;
    } else {
      fLocations = locations.filter((location) =>
        filters.includes(location.custom_attribute_1)
      );
    }
    return fLocations;
  };
  return !loading ? (
    <>
      <LocationFilters filters={filters} setFilters={setFilters} />
      <ScrollView
        maxBlockSize={ checkoutData.pickup?.selectedLocation ? 50 : 225}
        hint={{ type: "pill", content: "Scroll for more options" }}
        direction="block"
        scrollTo={scrollPos ? scrollPos : null}
        onScroll={(pos) => handleScroll(pos)}
      >
        <ChoiceList
          name="select location"
          value={
            checkoutData.pickup?.selectedLocation
              ? `${checkoutData.pickup.selectedLocation.info.id}`
              : ""
          }
          onChange={(id) => handleLocationSelect(id)}
          variant="group"
        >
          {getFilteredLocations().map((location) => (
            <Choice id={`${location.id}`}
           
            >
              <Text>{location.company_name}</Text>
            </Choice>
          ))}
        </ChoiceList>
      </ScrollView>
    </>
  ) : (
    <View position={"relative"}>
      <SkeletonImage blockSize={50} inlineSize={"fill"} aspectRatio={2} />
      <View
        maxBlockSize={75}
        maxInlineSize={75}
        position={{
          type: "absolute",
          inlineStart: `${50}%`,
          blockStart: `${50}%`,
        }}
        translate={{ block: `${-50}%`, inline: `${-50}%` }}
      >
        <Spinner size="fill" accessibilityLabel="Getting pickup locations" />
      </View>
    </View>
  );
};

export default LocationsSelect;
