import {
  Button,
  Divider,
  Form,
  TextField,
  InlineLayout,
  View,
  Icon,
} from "@shopify/ui-extensions-react/checkout";
import React, { useEffect, useState } from "react";

// TODO search code is built mixing two systems - REFACTOR

const LocationSearch = ({
  checkoutData,
  setProximityLocations,
  postcodeFetching,
  setPostcodeFetching,
  setFilteredLocations,
  cart,
  nextDay,
  url,
  setCS,
}) => {
  const [searchLocationQuery, setSearchLocationQuery] = useState(null);
  const [searchPostcodeQuery, setSearchPostcodeQuery] = useState(null);

  console.log("current checkout data: ", checkoutData);

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

  useEffect(() => {
    const getProximityLocations = async () => {
      console.log("getting locations with proximity to postcode");
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
        proximity_locations: pcCheckData.pickup.locations,
      });
      setFilteredLocations(checkoutData.pickup.proximityCollectLocations);
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
        ? (setSearchPostcodeQuery(null), setSearchLocationQuery(null))
        : setSearchLocationQuery(val);
      searchPostcodeQuery && val ? setSearchPostcodeQuery(null) : null;
    } else {
      searchPostcodeQuery && !val ? setSearchLocationQuery(null) : null;
      searchLocationQuery && val ? setSearchLocationQuery(null) : null;
    }
  };

  return (
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
  );
};

export default LocationSearch;
