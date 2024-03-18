import {
  Choice,
  ChoiceList,
  Heading,
  ScrollView,
  Text,
  View,
  useApplyAttributeChange,
  useApplyShippingAddressChange,
  Image,
  TextBlock,
  BlockLayout,
} from "@shopify/ui-extensions-react/checkout";
import { InlineLayout, InlineSpacer } from "@shopify/ui-extensions/checkout";
import React, { useEffect, useState } from "react";
import location_icons from "../../assets/LocationIcons.js";
import LocationSearch from "./LocationSearch.jsx";
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

  url,
  cart,
  nextDay,
  setProximityLocations,
  setCS,
  localStorage,
  currentShippingAddress,
  attributes,
}) => {
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
      company: targetLocation[0]?.company_name, 
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

  const getLocationName = (name) => {
    let index = name.indexOf(" - ");
    return name.slice(name[0], index);
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

  const getLocationType = (type) => {
    let firstLetter = type.charAt(0).toUpperCase();
    let singular = type.slice(1, type.length - 1);
    return `${firstLetter}${singular} Collection`;
  };


  return (
    <View padding={["base", "none", "base", "none"]}>
      <Heading>Find your nearest store or locker</Heading>
      {/* <Button onPress={() => getShippingRates()}>Click to Test Intuitive Shipping!</Button> */}
      <LocationSearch
        checkoutData={checkoutData}
        setProximityLocations={setProximityLocations}
        postcodeFetching={postcodeFetching}
        setPostcodeFetching={setPostcodeFetching}
        setFilteredLocations={setFilteredLocations}
        cart={cart}
        nextDay={nextDay}
        url={url}
        selectedChoice={selectedChoice}
        setSelectedChoice={setSelectedChoice}
        setCS={setCS}
      />
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
