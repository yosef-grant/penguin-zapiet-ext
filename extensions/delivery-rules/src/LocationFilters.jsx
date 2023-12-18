import {
  Choice,
  ChoiceList,
  InlineStack,
} from "@shopify/ui-extensions-react/checkout";
import { BlockStack, View } from "@shopify/ui-extensions/checkout";
import React from "react";

const LocationFilters = ({ filters, setFilters }) => {
  return (
    <View>
      <ChoiceList
        name="choiceMultiple"
        value={filters}
        onChange={(value) => {
          setFilters(value);
          console.log(`onChange event with value: ${value}`);
        }}
      >
        <InlineStack>
          <Choice
            id="stores"
            disabled={
              (filters.length > 1 && filters.includes("stores")) ||
              (filters.length === 1 && !filters.includes("stores"))
                ? false
                : true
            }
          >
            Stores
          </Choice>
          <Choice
            id="lockers"
            disabled={
              (filters.length > 1 && filters.includes("lockers")) ||
              (filters.length === 1 && !filters.includes("lockers"))
                ? false
                : true
            }
          >
            Lockers
          </Choice>
        </InlineStack>
      </ChoiceList>
    </View>
  );
};

export default LocationFilters;
