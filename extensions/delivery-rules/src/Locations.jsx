import {
  Choice,
  ChoiceList,
  Heading,
  ScrollView,
  Text,
  TextField,
  View,
  useApi,
  useApplyAttributeChange,
  useApplyShippingAddressChange,
  Button,
  Form
} from "@shopify/ui-extensions-react/checkout";
import { InlineLayout, InlineSpacer } from "@shopify/ui-extensions/checkout";
import React, { useEffect, useState } from "react";

const Locations = ({
  checkoutData,
  selectLocation,
  removeLocation,
  url,
  cart,
  nextDay,
  setProximityLocations,
}) => {
  const [searchLocationQuery, setSearchLocationQuery] = useState(null);
  const [searchPostcodeQuery, setSearchPostcodeQuery] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState(
    checkoutData.pickup.qCollectLocations
  );
  const [scrollPos, setScrollPos] = useState(0);
  const [postcodeError, setPostcodeError] = useState(false);

  const changeShippingAddress = useApplyShippingAddressChange();
  const changeAttributes = useApplyAttributeChange();

  const handleScroll = (posVal) => {
    setScrollPos(posVal.position.block);
  };
  const { query } = useApi();

  const handleLocationSelect = async (val) => {
    console.log("this is the id of the selected location! ", val);

    let targetLocation = checkoutData.pickup.qCollectLocations.filter(
      (location) => location.id === parseInt(val.replace(/[^0-9]/g, ""))
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

    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Location-Id",
      value: `${targetLocation[0].id}`,
    });

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

    // console.log(
    //   '>>>>>>>>>>>> TIMES ',
    //   times,
    //   '<<<<<<<<<<<<<<<<< HOURS: ',
    //   locHours
    // );
    // // console.log("loc __--^^^--__ data ", locData);

    let targetLocationAddr = {
      address1: targetLocation[0].address_line_1,
      city: targetLocation[0].city,
      zip: targetLocation[0].postal_code,
    };

    await changeShippingAddress({
      type: "updateShippingAddress",
      address: targetLocationAddr,
    });

    selectLocation(locHours, metaobject.description.value, targetLocation[0]);
  };

  useEffect(() => {
    const getProximityLocations = async () => {
      let checkBody = {
        type: "pickup",
        postcode: searchPostcodeQuery,
        cart: cart,
        twoDayDelivery: nextDay,
      };
      let checkRes = await fetch(`${url}/pza/check-postcode-test`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(checkBody),
      });
      let pcCheckData = await checkRes.json();

      console.log("FROM PROXIMITY CHECK: ", pcCheckData);

      setProximityLocations({
        pickup_locations: pcCheckData.pickup.locations,
      });

      console.log("Postcode availability data: ", pcCheckData);
      setFilteredLocations(pcCheckData.pickup.locations);
    };

    // setCollectLocations({
    //   delivery: pcCheckData.delivery,
    //   shipping: pcCheckData.shipping,
    //   pickup_locations: pcCheckData.pickup.locations,
    // });
    // setDisplayCalendar(false);

    // // * show pickup method by default & show pickup rate
    // setSelectedMethod('pickup');

    // await setCartLineAttr({
    //   type: 'updateCartLine',
    //   id: cartLines[0].id,
    //   attributes: [
    //     {
    //       key: '_deliveryID',
    //       value: 'P',
    //     },
    //   ],
    // });

    // setPostcode(shippingAddress.zip);
    //}
    //   else {
    //     setError('Postcode not recognised!');
    //     setPostcode(null);
    //   }
    //   setLoading(false);
    // } else if (shippingAddress.zip.length === 12) {
    //   let status = await checkCS(shippingAddress.zip);
    //   if (status === true) {
    //     setCS((cs) => {
    //       return { ...cs, status: true };
    //     });
    //     await setAddress({
    //       type: 'updateShippingAddress',
    //       address: { zip: '' },
    //     });
    //   }
    //   setLoading(false);
    // } else {
    //   error ? setError('') : null;
    //   postcode ? setPostcode() : null;
    // }
    //     }
    //   };
    //   searchPostcodeQuery ? checkPostcodeSearch() : null;
    searchPostcodeQuery ? getProximityLocations() : null;
  }, [searchPostcodeQuery]);

  const handleChange = async (val, type) => {
    console.log(val);
    if (type === "location") {
      searchPostcodeQuery ? setSearchPostcodeQuery(null) : null;
      setSearchLocationQuery(val);
    } else {
      searchLocationQuery ? setSearchLocationQuery(null) : null;
      // * Validate postcode

      if (val.length < 12 && val.length > 0) {
        let postcodeRes = await fetch(
          `https://api.postcodes.io/postcodes/${val}`,
          {
            method: "GET",
          }
        );

        let postcodeData = await postcodeRes.json();

        console.log(postcodeData.result);

        postcodeData.result
          ? setSearchPostcodeQuery(postcodeData.result.postcode)
          : null; // * handle postcode result error
      }

      // * set locations in proximity order in useEffect
    }
  };

  const handleInput = (val, type) => {
    if (type === "location") {
      searchLocationQuery && !val
        ? (removeLocation(), setSearchPostcodeQuery(null), setSearchLocationQuery(null))
        : null;
        searchPostcodeQuery && val ? setSearchPostcodeQuery(null) : null
      } else {
        searchPostcodeQuery && !val ? setSearchLocationQuery(null) : null;
        searchLocationQuery && val ? setSearchLocationQuery(null) : null
    }
  };

  useEffect(() => {
    let unfiltered = checkoutData.pickup.qCollectLocations;
    if (searchLocationQuery) {
      let x = [];
      unfiltered.forEach((location) => {
        location.company_name
          .toLowerCase()
          .includes(searchLocationQuery.toLowerCase())
          ? x.push(location)
          : null;
      });
      setFilteredLocations(x);
    } else {
      !searchLocationQuery
        ? setFilteredLocations(unfiltered)
        : null;
    }
  }, [searchLocationQuery]);


  return (
    <View padding={["base", "none", "base", "none"]}>
      <Heading>Find your nearest store or locker</Heading>
      <Form
      onSubmit={() => console.log('form submitted!')}
      >
  <InlineLayout
        columns={[`fill`, "fill", "auto"]}
        spacing="base"
        padding={["base", "none", "base", "none"]}
      >
        <TextField
          label="Search by location name"
          onChange={(val) => handleChange(val, "location")}
          onInput={(val) => handleInput(val, "location")}
          value={searchLocationQuery}
        />
        <TextField
          label="Search by proximity"
          onChange={(val) => handleChange(val, "postcode")}
          onInput={(val) => handleInput(val, "postcode")}
          value={searchPostcodeQuery}
        />
        <Button accessibilityRole="submit">Search</Button>
      </InlineLayout>
      </Form>
      <ScrollView
        maxBlockSize={275}
        hint={{ type: "pill", content: "Scroll for more options" }}
        direction="block"
        //scrollTo={scrollPos ? scrollPos : disabled ? 0 : null}
        scrollTo={scrollPos ? 0 : null}
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
          {filteredLocations.map((location, i) => (
            <Choice
              key={`${location}${i}`}
              id={`${location.id}`}
              secondaryContent={
                location.distance !== null ? `${location.distance} miles` : ""
              }
            >
              <Text appearance="decorative">{location.company_name}</Text>
            </Choice>
          ))}
        </ChoiceList>
      </ScrollView>
    </View>
  );
};

export default Locations;
