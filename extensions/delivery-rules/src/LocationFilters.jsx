import {
  Choice,
  ChoiceList,
  InlineStack,
  TextField,
  InlineLayout,
  InlineSpacer,
} from '@shopify/ui-extensions-react/checkout';
import { BlockStack, View } from '@shopify/ui-extensions/checkout';

import React from 'react';


const LocationFilters = ({
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
}) => {


  const handleInput = (val) => {
    console.log(val);
    setSearchQuery(val);
  };

  return (
    <View
      blockAlignment="center"
      // inlineAlignment="end"
      padding={['none', 'none', 'tight', 'none']}
    >
      <InlineLayout columns={['fill', 'auto', 'auto']}>
        <TextField
          label="Find a store or locker"
          icon={{ source: 'geolocation', position: 'start' }}
          onInput={(val) => handleInput(val)}
          value={searchQuery}
        />
        <InlineSpacer />
        <ChoiceList
          name="choiceMultiple"
          value={filters}
          onChange={(value) => {
            setFilters(value);
            console.log(`onChange event with value: ${value}`);
          }}
        >
          <InlineStack blockAlignment={'center'}>
            <Choice
              id="stores"
              disabled={
                (filters.length > 1 && filters.includes('stores')) ||
                (filters.length === 1 && !filters.includes('stores'))
                  ? false
                  : true
              }
            >
              Stores
            </Choice>
            <Choice
              id="lockers"
              disabled={
                (filters.length > 1 && filters.includes('lockers')) ||
                (filters.length === 1 && !filters.includes('lockers'))
                  ? false
                  : true
              }
            >
              Lockers
            </Choice>
          </InlineStack>
        </ChoiceList>
      </InlineLayout>
    </View>
  );
};

export default LocationFilters;
