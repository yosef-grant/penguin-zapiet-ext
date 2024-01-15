import { useApi } from '@shopify/ui-extensions-react/checkout';
import LocationFilters from './LocationFilters.jsx';
import { useState, useEffect } from 'react';
import BlockLoader from './BlockLoader.jsx';
import LocationInfo from './LocationInfo.jsx';
import LocationList from './LocationList.jsx';

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
  removeLocation,
  searchQuery,
  setSearchQuery
}) => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(['stores', 'lockers']);
 

  const { query } = useApi();

  return !loading ? (
    <>
      <>
        {!checkoutData?.pickup?.selectedLocation ? (
          <>
            <LocationFilters
              filters={filters}
              setFilters={setFilters}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              
            />
            <LocationList
              locations={locations}
              query={query}
              disabled={disabled}
              checkoutData={checkoutData}
              filters={filters}
              setSelectedMethod={setSelectedMethod}
              selectLocation={selectLocation}
              pathway={pathway}
              searchQuery={searchQuery}
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
    </>
  ) : (
    <BlockLoader type="locations" />
  );
};

export default LocationsSelect;
