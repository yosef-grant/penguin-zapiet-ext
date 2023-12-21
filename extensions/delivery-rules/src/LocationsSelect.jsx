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
  Icon,
} from "@shopify/ui-extensions-react/checkout";
import LocationFilters from "./LocationFilters.jsx";
import { Select, Heading } from "@shopify/ui-extensions/checkout";
import { format, getDay } from "date-fns";
import { useState, useEffect } from "react";
import BlockLoader from "./BlockLoader.jsx";
import LocationInfo from "./LocationInfo.jsx";
import DisabledState from "./DisabledState.jsx";
import LocationList from "./LocationList.jsx";

const LocationsSelect = ({
  locations,
  checkoutData,

  setMinDate,
  nextDay,
  cart,
  setPenguinCart,
  url,
  setSelectedMethod,
  setDisplayCalendar,
  pathway,
  disabled,
  selectLocation,
  confirmLocation,
  removeLocation
}) => {
  useEffect(() => {
    console.log("£££££££££££££££ ", checkoutData);
  }, [checkoutData]);

  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(["stores", "lockers"]);

  const { query } = useApi();

  return !loading ? (
    <>
      {!disabled ? (
        <>
          {!checkoutData?.pickup?.selectedLocation ? (
            <>
              <LocationFilters filters={filters} setFilters={setFilters} />
              <LocationList
                locations={locations}
                query={query}
                disabled={disabled}
                checkoutData={checkoutData}
  
                filters={filters}
                setSelectedMethod={setSelectedMethod}
                selectLocation={selectLocation}
              />
            </>
          ) : (
            <LocationInfo
              location={checkoutData.pickup.selectedLocation}

              checkoutData={checkoutData}
              setLoading={setLoading}
              setDisplayCalendar={setDisplayCalendar}
              setPenguinCart={setPenguinCart}
              setMinDate={setMinDate}
              pathway={pathway}
              cart={cart}
              nextDay={nextDay}
              url={url}
              confirmLocation={confirmLocation}
              removeLocation={removeLocation}
            />
          )}
        </>
      ) : (
        <DisabledState />
      )}
    </>
  ) : (
    <BlockLoader />
  );
};

export default LocationsSelect;
