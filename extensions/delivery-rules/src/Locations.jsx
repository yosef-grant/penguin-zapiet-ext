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
} from '@shopify/ui-extensions-react/checkout';
import { InlineLayout, InlineSpacer } from '@shopify/ui-extensions/checkout';
import React, { useEffect, useState } from 'react';
import location_icons from './assets/LocationIcons';
// import StoreImg from './assets/postal.png'

const weekdays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// TODO fix auto scroll in list when user selects location
// ? image URLs may need adjusting when live
// ? graphql seems very slow on mobile - remove query from here to improve speed
const StoresIcon =
  'https://cdn.shopify.com/s/files/1/0575/1468/8647/files/store.svg?v=1706175861';
const LockersIcon =
  'https://cdn.shopify.com/s/files/1/0575/1468/8647/files/locker.svg?v=1706175882';

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
}) => {
  const [searchLocationQuery, setSearchLocationQuery] = useState(null);
  const [searchPostcodeQuery, setSearchPostcodeQuery] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState(
    checkoutData.pickup.qCollectLocations
  );


  const [postcodeError, setPostcodeError] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const changeShippingAddress = useApplyShippingAddressChange();
  const changeAttributes = useApplyAttributeChange();

  const { query } = useApi();

  const handleLocationSelect = async (val) => {
    setSelectedLocation(null);
    setSelectedChoice(val);
    let targetLocation = checkoutData.pickup.qCollectLocations.filter(
      (location) => location.id === parseInt(val.replace(/[^0-9]/g, ''))
    );

    
    let targetLocationAddr = {
      address1: targetLocation[0].address_line_1,
      city: targetLocation[0].city,
      zip: targetLocation[0].postal_code,
    };

    await changeShippingAddress({
      type: 'updateShippingAddress',
      address: targetLocationAddr,
    });

    let locationHandle = targetLocation[0].company_name
      .toLowerCase()
      .replaceAll(/\s?[$&+,:;=?@#|'<>.^*()%!-]/gm, '')
      .replaceAll(/\s/gm, '-');

    // let {
    //   data: { metaobject },
    // } = await query(
    //   `
    //           {
    //             metaobject(
    //               handle: {type: "store_location", handle: "${locationHandle}"}
    //             ) {
    //               location_type: field(key: "store_type") {
    //                 value
    //               }
    //               zapiet_id: field(key: "zapiet_location_id") {
    //                 value
    //               }
    //               description: field(key: "description") {
    //                 value
    //               }
    //               opening_hours: field(key: "opening_time") {
    //                 references(first: 50) {
    //                   nodes {
    //                     ... on Metaobject {
    //                       fields {
    //                         key
    //                         value
    //                       }
    //                     }
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //           `
    // );

    await changeAttributes({
      type: 'updateAttribute',
      key: 'Pickup-Location-Id',
      value: `${targetLocation[0].id}`,
    });

    await changeAttributes({
      type: 'updateAttribute',
      key: 'Pickup-Location-Company',
      value: targetLocation[0].company_name,
    });
    await changeAttributes({
      type: 'updateAttribute',
      key: 'Pickup-Location-Type',
      value: targetLocation[0].custom_attribute_1,
    });



    // const {
    //   opening_hours: {
    //     references: {
    //       nodes: [{ fields: times }],
    //     },
    //   },
    // } = metaobject;

    // let locHours = times.reduce(
    //   (obj, item) => ({
    //     ...obj,
    //     [item.key]: item.value,
    //   }),
    //   {}
    // );

    // console.log(
    //   '>>>>>>>>>>>> TIMES ',
    //   times,
    //   '<<<<<<<<<<<<<<<<< HOURS: ',
    //   locHours
    // );
    // // console.log("loc __--^^^--__ data ", locData);

    

    // localStorage.write('selected_location_info', {
    //   location: targetLocation[0],
    //   hours: locHours,
    //   description: metaobject.description.value,
    // });

    // setSelectedLocation({
    //   hours: locHours,
    //   description: metaobject.description.value,
    // });
    // selectLocation(locHours, metaobject.description.value, targetLocation[0]);
 
  };

  useEffect(() => {
    const getProximityLocations = async () => {
      let checkBody = {
        type: 'pickup',
        postcode: searchPostcodeQuery,
        cart: cart,
        twoDayDelivery: nextDay,
      };
      let checkRes = await fetch(`${url}/pza/check-postcode-test`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(checkBody),
      });
      let pcCheckData = await checkRes.json();

      console.log('FROM PROXIMITY CHECK: ', pcCheckData);

      setProximityLocations({
        pickup_locations: pcCheckData.pickup.locations,
      });

      console.log('Postcode availability data: ', pcCheckData);
      setFilteredLocations(pcCheckData.pickup.locations);
    };


    searchPostcodeQuery ? getProximityLocations() : null;
  }, [searchPostcodeQuery]);

  const handleChange = async (val, type) => {
    console.log(val);
    if (type === 'location') {
      searchPostcodeQuery ? setSearchPostcodeQuery(null) : null;
      setSearchLocationQuery(val);
    } else {
      searchLocationQuery ? setSearchLocationQuery(null) : null;
      // * Validate postcode

      if (val.length < 12 && val.length > 0) {
        let postcodeRes = await fetch(
          `https://api.postcodes.io/postcodes/${val}`,
          {
            method: 'GET',
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
            'Content-Type': 'application/json',
          },
          method: 'POST',
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
    if (type === 'location') {
      searchLocationQuery && !val
        ? (removeLocation(),
          setSearchPostcodeQuery(null),
          setSearchLocationQuery(null))
        : null;
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
    let index = name.indexOf(' - ');
    return name.slice(name[0], index);
  };

  const getLocationType = (type) => {
    let firstLetter = type.charAt(0).toUpperCase();
    let singular = type.slice(1, type.length - 1);
    return `${firstLetter}${singular} Collection`;
  };

  return (
    <View padding={['base', 'none', 'base', 'none']}>
      <Heading>Find your nearest store or locker</Heading>
      <Form onSubmit={() => console.log('form submitted!')}>
        <InlineLayout
          columns={[`fill`, 'fill', 'auto']}
          spacing="base"
          padding={['base', 'none', 'base', 'none']}
        >
          <TextField
            label="Search by location name"
            onChange={(val) => handleChange(val, 'location')}
            onInput={(val) => handleInput(val, 'location')}
            value={searchLocationQuery}
          />
          <TextField
            label="Search by proximity"
            onChange={(val) => handleChange(val, 'postcode')}
            onInput={(val) => handleInput(val, 'postcode')}
            value={searchPostcodeQuery}
          />
          <Button accessibilityRole="submit">Search</Button>
        </InlineLayout>
      </Form>
      <ScrollView
        maxBlockSize={280}
        hint={{ type: 'pill', content: 'Scroll for more options' }}
        direction="block"
      >
        <ChoiceList
          name="select location"
          value={selectedChoice ? selectedChoice : ''}
          onChange={(id) => handleLocationSelect(id)}
          variant="group"
        >
          {filteredLocations.map((location, i) => (
            <Choice
              key={`${location}${i}`}
              id={`${location.id}`}
              secondaryContent={
                <InlineLayout
                  inlineAlignment="end"
                  blockAlignment="center"
                  columns={location.distance ? ['auto', 'auto'] : 'auto'}
                >
                  {location.distance !== null ? (
                    <>
                      <Text>{`${location.distance} miles`}</Text>
                      <InlineSpacer spacing="tight" />
                    </>
                  ) : null}
                  <Image
                    source={
                      location.custom_attribute_1 === 'lockers'
                        ? LockersIcon
                        : StoresIcon
                    }
                  />
                </InlineLayout>
              }
              tertiaryContent={getLocationType(location.custom_attribute_1)}
              // details={
              //   selectedLocation ? (
              //     <Grid rows={["fill"]} columns={[`${25}%`, `${75}%`]}>
              //       <GridItem columnSpan={1} rowSpan={1}>
              //         <List marker={"none"} spacing="tight">
              //           {weekdays.map((weekday, i) => (
              //             <ListItem key={`${weekday}${i}`}>
              //               <Text size={"small"} emphasis="bold">
              //                 {`${weekday.slice(0, 3)}: `}
              //               </Text>
              //               <Text size="small">
              //                 {
              //                   selectedLocation.hours[
              //                     `${weekday.toLowerCase()}_opening_hours`
              //                   ]
              //                 }
              //               </Text>
              //             </ListItem>
              //           ))}
              //         </List>
              //       </GridItem>
              //       <GridItem>
              //         <TextBlock size="small">
              //           {selectedLocation.description}
              //         </TextBlock>
              //       </GridItem>
              //     </Grid>
              //   ) : (
              //     <SkeletonTextBlock size="small" lines={7} />
              //   )
              // }
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
