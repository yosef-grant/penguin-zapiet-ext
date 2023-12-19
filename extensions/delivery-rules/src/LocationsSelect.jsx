import {
  SkeletonTextBlock,
  useApi,
  useApplyAttributeChange,
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
import BlockLoader from "./BlockLoader.jsx";
import LocationInfo from "./LocationInfo.jsx";

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

    console.log("this is the id of the selected location! ", val);

    let targetLocation = locations.filter(
      (location) => location.id === parseInt(val)
    );


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

    // console.log("loc __--^^^--__ data ", locData);
    let x = checkoutData;
    x?.delivery ? null : (x.qCollect = true);
    x.pickup = {
      ...x.pickup,
      selectedLocation: {
        location_hours: locHours,
        location_description: metaobject.description.value,

        info: targetLocation[0],
      },
    };

    console.log("#~~::: X", x);
    setCheckoutData(JSON.parse(JSON.stringify(x)));
    setSelectedMethod("pickup");
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
      {!checkoutData?.pickup?.selectedLocation ? (
        <>
          <LocationFilters filters={filters} setFilters={setFilters} />
          <ScrollView
            maxBlockSize={275}
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
                <Choice id={`${location.id}`}>
                  <Text>{location.company_name}</Text>
                </Choice>
              ))}
            </ChoiceList>
          </ScrollView>
        </>
      ) : (
        <LocationInfo
          location={checkoutData.pickup.selectedLocation}
          setCheckoutData={setCheckoutData}
          checkoutData={checkoutData}
          setLoading={setLoading}
          setDisplayCalendar={setDisplayCalendar}
          setPenguinCart={setPenguinCart}
          setMinDate={setMinDate}
          pathway={pathway}
          cart={cart}
          nextDay={nextDay}
          url={url}
        />
      )}
    </>
  ) : (
    <BlockLoader />
  );
};

export default LocationsSelect;
