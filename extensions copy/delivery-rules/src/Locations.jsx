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
  Form,
  Image,
  Icon,
  GridItem,
  Grid,
  List,
  ListItem,
  TextBlock,
  SkeletonTextBlock,
  Divider,
  BlockLayout,
} from "@shopify/ui-extensions-react/checkout";
import { InlineLayout, InlineSpacer } from "@shopify/ui-extensions/checkout";
import React, { useEffect, useState } from "react";
import location_icons from "./assets/LocationIcons";
// import StoreImg from './assets/postal.png'

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// TODO fix auto scroll in list when user selects location
// ? image URLs may need adjusting when live
// ? graphql seems very slow on mobile - remove query from here to improve speed
const StoresIcon =
  "https://cdn.shopify.com/s/files/1/0575/1468/8647/files/store.svg?v=1706175861";
const LockersIcon =
  "https://cdn.shopify.com/s/files/1/0575/1468/8647/files/locker.svg?v=1706175882";

const Locations = ({
  checkoutData,
  selectLocation,
  removeLocation,
  url,
  cart,
  nextDay,
  setProximityLocations,
  setCS,
  localStorage,
  currentShippingAddress,
  attributes,
}) => {
  const [searchLocationQuery, setSearchLocationQuery] = useState(null);
  const [searchPostcodeQuery, setSearchPostcodeQuery] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(null);

  const [filteredLocations, setFilteredLocations] = useState(
    checkoutData.pickup.qCollectLocations
  );

  const [postcodeError, setPostcodeError] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [postcodeFetching, setPostcodeFetching] = useState(false);

  const changeShippingAddress = useApplyShippingAddressChange();
  const changeAttributes = useApplyAttributeChange();

  const handleLocationSelect = async (val) => {
    setSelectedChoice(val);

    console.log("new choice ID: ", val, typeof val);
    let targetLocation = checkoutData.pickup.qCollectLocations.filter(
      (location) =>
        parseInt(location.id) === parseInt(val.replace(/[^0-9]/g, ""))
    );

    setSelectedPickupLocation(targetLocation[0]);

    console.log("HERE IS THE TARGET LOCATION: ", targetLocation);

    let targetLocationAddr = {
      address1: targetLocation[0].address_line_1,
      city: targetLocation[0].city,
      zip: targetLocation[0].postal_code,
    };
    setSelectedLocation(targetLocationAddr);

    await changeShippingAddress({
      type: "updateShippingAddress",
      address: targetLocationAddr,
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

    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Location-Id",
      value: `${targetLocation[0].id}`,
    });
  };

  useEffect(() => {
    const resetShippingAddress = async () => {
      await changeShippingAddress({
        type: "updateShippingAddress",
        address: {
          address1: "",
          city: "",
          zip: "",
        },
      });
    };

    const revertShippingAddress = async () => {
      console.log(
        "from revert: ",
        JSON.stringify(selectedLocation),
        JSON.stringify(currentShippingAddress)
      );
      JSON.stringify(selectedLocation) !==
      JSON.stringify(currentShippingAddress)
        ? await changeShippingAddress({
            type: "updateShippingAddress",
            address: {
              address1: selectedLocation.address1,
              address2: undefined,
              city: selectedLocation.city,
              zip: selectedLocation.zip,
            },
          })
        : null;
    };

    if (
      selectedLocation === null &&
      attributes["Checkout-Method"] === "pickup"
    ) {
      resetShippingAddress();
    } else if (
      selectedLocation !== null &&
      attributes["Checkout-Method"] === "pickup"
    ) {
      revertShippingAddress();
    }
    console.log(
      "from locations - shipping address has changed! location: ",
      selectedLocation
    );
  }, [currentShippingAddress]);

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
      setPostcodeFetching(false);
    };

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

      if (
        val.length < 12 &&
        val.length > 0 &&
        (!searchPostcodeQuery ||
          val.toLowerCase().replace(/\s/, "") !==
            searchPostcodeQuery.toLowerCase().replace(/\s/, ""))
      ) {
        setPostcodeFetching(true);
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
      } else if (val.length === 12) {
        const res = await fetch(`${url}/pza/check-pw`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            pw: val,
          }),
        });
        let z = await res.json();

        if (z.status === true) {
          setCS({ status: z.status });
        }
      }

      // (*) set locations in proximity order in useEffect
    }
  };

  const handleInput = (val, type) => {
    if (type === "location") {
      searchLocationQuery && !val
        ? (removeLocation(),
          setSearchPostcodeQuery(null),
          setSearchLocationQuery(null))
        : setSearchLocationQuery(val);
      searchPostcodeQuery && val ? setSearchPostcodeQuery(null) : null;
    } else {
      searchPostcodeQuery && !val ? setSearchLocationQuery(null) : null;
      searchLocationQuery && val ? setSearchLocationQuery(null) : null;
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
      !searchLocationQuery ? setFilteredLocations(unfiltered) : null;
    }
  }, [searchLocationQuery]);

  const getLocationName = (name) => {
    let index = name.indexOf(" - ");
    return name.slice(name[0], index);
  };

  const getLocationType = (type) => {
    let firstLetter = type.charAt(0).toUpperCase();
    let singular = type.slice(1, type.length - 1);
    return `${firstLetter}${singular} Collection`;
  };

  const getShippingRates = async () => {
    const myHeaders = new Headers();
    myHeaders.append(
      "Intuitive-Partner-Api-Key",
      "e6c32bf8-2303-488d-b851-c6e277a6d1c3"
    );
    myHeaders.append(
      "Intuitive-Account-Api-Key",
      "ae6b7232-22eb-4779-ab23-980205cde95c"
    );
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      origin: {
        country: "GB",
        province: "ENG",
        postal_code: "NW10 7NH",
      },
      destination: {
        address_1: "54 london",
        address_2: "",
        city: "London",
        province_code: "ENG",
        country: "GB",
        postal_code: "NW11 9QS",
      },
      products: [
        {
          quantity: 1,
          product_id: 7600812818626,
          variant_id: 42840933400770,
        },
      ],
      currency: "GBP",
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    let y = await fetch("https://intuitiveshipping.io/rating", requestOptions);

    console.log(y);
  };

  return (
    <View padding={["base", "none", "base", "none"]}>
      <Heading>Find your nearest store or locker</Heading>
      {/* <Button onPress={() => getShippingRates()}>Click to Test Intuitive Shipping!</Button> */}
      <Form onSubmit={() => console.log("form submitted!")}>
        <InlineLayout
          columns={[`fill`, "auto", "fill"]}
          spacing="base"
          padding={["base", "none", "base", "none"]}
        >
          <TextField
            label="Search by location name"
            onChange={(val) => handleChange(val, "location")}
            onInput={(val) => handleInput(val, "location")}
            value={searchLocationQuery}
          />
          <Divider direction={"block"} />
          <View>
            <InlineLayout spacing="extraTight" columns={["fill", 45]}>
              <TextField
                label="Search by proximity"
                onChange={(val) => handleChange(val, "postcode")}
                onInput={(val) => handleInput(val, "postcode")}
                value={searchPostcodeQuery}
                disabled={postcodeFetching ? true : false}
              />
              <Button
                accessibilityRole="submit"
                loading={postcodeFetching ? true : false}
              >
                <Icon source="magnify" />
              </Button>
            </InlineLayout>
          </View>
        </InlineLayout>
      </Form>
      <ScrollView
        maxBlockSize={320}
        hint={{ type: "pill", content: "Scroll for more options" }}
        direction="block"
        scrollTo={{ id: selectedChoice }}
      >
        <ChoiceList
          name="select location"
          value={selectedChoice ? selectedChoice : ""}
          onChange={(id) => handleLocationSelect(id)}
          variant="group"
        >
          {filteredLocations.map((location, i) => (
            <Choice
              disabled={postcodeFetching ? true : false}
              key={`${location}${i}`}
              id={`${location.id}`}
              secondaryContent={
                <InlineLayout
                  inlineAlignment="end"
                  blockAlignment="center"
                  columns={location.distance ? ["auto", "auto"] : "auto"}
                >
                  {location.distance !== null ? (
                    <>
                      <Text>{`${location.distance} miles`}</Text>
                      <InlineSpacer spacing="tight" />
                    </>
                  ) : null}
                  <Image
                    source={
                      location.custom_attribute_1 === "lockers"
                        ? LockersIcon
                        : StoresIcon
                    }
                  />
                </InlineLayout>
              }
              tertiaryContent={getLocationType(location.custom_attribute_1)}
              details={
                <InlineLayout
                  padding={["extraTight", "none", "base", "none"]}
                  columns={[135, "fill"]}
                  spacing={"loose"}
                >
                  <View padding={["none", "none", "none", "tight"]}>
                    <Heading>Opening Hours</Heading>
                    <View padding={["extraTight", "none", "none", "none"]}>
                      <BlockLayout>
                        {weekdays.map((weekday, i) => (
                          <View key={`${weekday}${i}`} position={"relative"}>
                            <InlineLayout
                              spacing="extraTight"
                              blockAlignment="center"
                              columns={["auto", "fill"]}
                              inlineAlignment={"end"}
                            >
                              <Text size={"base"} emphasis="bold">
                                {`${weekday.slice(0, 3)}: `}
                              </Text>
                              <Text size={"base"}>
                                {`${
                                  location.meta_hours[
                                    `${weekday.toLowerCase()}_opening_hours`
                                  ]
                                } 
                            `}
                              </Text>
                            </InlineLayout>
                          </View>
                        ))}
                      </BlockLayout>
                    </View>
                  </View>
                  <View>
                    <Heading>Where to find</Heading>
                    <TextBlock>{location.meta_description}</TextBlock>
                  </View>
                </InlineLayout>
                // <Grid rows={["fill"]} columns={[`${25}%`, `${75}%`]}>
                //   <GridItem columnSpan={1} rowSpan={1}>
                //     <List marker={"none"} spacing="tight">
                //       {weekdays.map((weekday, i) => (
                //         <ListItem key={`${weekday}${i}`}>
                //           <Text size={"small"} emphasis="bold">
                //             {`${weekday.slice(0, 3)}: `}
                //           </Text>
                //           <Text size="small">
                //             {`${
                //               selectedPickupLocation.meta_hours[
                //                 `${weekday.toLowerCase()}_opening_hours`
                //               ].open
                //             } - ${
                //               selectedPickupLocation.meta_hours[
                //                 `${weekday.toLowerCase()}_opening_hours`
                //               ].close
                //             }
                //             `}
                //           </Text>
                //         </ListItem>
                //       ))}
                //     </List>
                //   </GridItem>
                //   <GridItem>
                //     <TextBlock size="small">
                //       {selectedPickupLocation.meta_description}
                //     </TextBlock>
                //   </GridItem>
                // </Grid>
              }
            >
              <Text appearance="decorative">
                {getLocationName(location.company_name)}
              </Text>
            </Choice>
          ))}
        </ChoiceList>
      </ScrollView>
    </View>
  );
};

export default Locations;
