import {
  Choice,
  ChoiceList,
  ScrollView,
  Text,
  useApplyAttributeChange,
  useApplyCartLinesChange,
  useCartLines,
} from '@shopify/ui-extensions-react/checkout';
import React, { useState } from 'react';

const LocationList = ({
  locations,
  query,
  disabled,
  checkoutData,
  filters,
  setSelectedMethod,
  selectLocation,
  pathway,
  searchQuery,
}) => {
  const [scrollPos, setScrollPos] = useState(null);

  const changeAttributes = useApplyAttributeChange();
  const setCartLineAttr = useApplyCartLinesChange();
  const cartLines = useCartLines();
  
  
  const handleLocationSelect = async (val) => {
    console.log(
      'llllllllllllllllllllll ',
      checkoutData,
      '\n',
      'choice val: ',
      val,
      '\n current pathway: ',
      pathway
    );

    console.log('this is the id of the selected location! ', val);

    let targetLocation = locations.filter(
      (location) => location.id === parseInt(val.replace(/[^0-9]/g, ''))
    );

    let locationHandle = targetLocation[0].company_name
      .toLowerCase()
      .replaceAll(/\s?[$&+,:;=?@#|'<>.^*()%!-]/gm, '')
      .replaceAll(/\s/gm, '-');

    console.log(';;;;;;;;;;;;;;;;;;; locationHandle ', locationHandle);

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

    console.log('|||||||||||||||||||| data: ', metaobject);

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

    await changeAttributes({
      type: 'updateAttribute',
      key: 'buyer-pathway',
      value: pathway,
    });

    if (pathway === 'quick-collect') {
      await setCartLineAttr({
        type: 'updateCartLine',
        id: cartLines[0].id,
        attributes: [
          cartLines[0].attributes,
          {
            key: '_deliveryID',
            value: 'P',
          },
        ],
      });
    }
    console.log(
      '>>>>>>>>>>>> TIMES ',
      times,
      '<<<<<<<<<<<<<<<<< HOURS: ',
      locHours
    );
    // console.log("loc __--^^^--__ data ", locData);
    setSelectedMethod('pickup');
    selectLocation(locHours, metaobject.description.value, targetLocation[0]);
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

    if (searchQuery) {
      let x = [];
      fLocations.forEach((location) => {
        location.company_name.toLowerCase().includes(searchQuery.toLowerCase())
          ? x.push(location)
          : null;
      });


      fLocations = x;
      console.log(x);
    }

    return fLocations;
  };
  return (
    <>
      <ScrollView
        maxBlockSize={275}
        hint={{ type: 'pill', content: 'Scroll for more options' }}
        direction="block"
        scrollTo={scrollPos ? scrollPos : disabled ? 0 : null}
        onScroll={(pos) => handleScroll(pos)}
      >
        <ChoiceList
          name="select location"
          value={
            checkoutData.pickup?.selectedLocation
              ? `${checkoutData.pickup.selectedLocation.info.id}`
              : ''
          }
          onChange={(id) => handleLocationSelect(id)}
          variant="group"
        >
          {getFilteredLocations().map((location, i) => (
            <Choice
              key={`${location}${pathway === 'method-select' ? i : i + 2}`}
              id={`${location.id}-${pathway}`}
              secondaryContent={
                location.distance !== null ? `${location.distance} miles` : ''
              }
            >
              <Text appearance="decorative">{location.company_name}</Text>
            </Choice>
          ))}
        </ChoiceList>
      </ScrollView>
    </>
  );
};

export default LocationList;
