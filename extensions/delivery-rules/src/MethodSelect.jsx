import React from 'react';
import {
  InlineLayout,
  Pressable,
  Text,
  View,
} from '@shopify/ui-extensions-react/checkout';
import CSPortal from './CSPortal.jsx';
import Locations from './Locations.jsx';

const MethodSelect = ({
  attributes,
  checkoutData,
  setCS,
  cs,
  url,
  lineItems,
  nextDay,
  handleSelectPickupLocation,
  handleRemoveSelectedLocation,
  handleSetCollectLocations,
  handleMethodSelect,
localStorage,

}) => {
  return (
    <>
      {/* <Button >Base</Button>
  <Button >Accent</Button>
  <Button >Decorative</Button>
  <Button >interactive</Button>
  <Button >subdued</Button>
  <Button >info</Button>
  <Button >success</Button>
  <Button >warning</Button>
  <Button >critical</Button>
<Button >monochrome</Button> */}
      <InlineLayout spacing={'tight'}>
        <Pressable
          // disabled={checkoutData?.methods?.pickup === false ? true : false}
          inlineAlignment={'center'}
          blockAlignment={'center'}
          cornerRadius={'base'}
          minBlockSize={50}
          border={'base'}
          background={
            attributes['Checkout-Method'] &&
            attributes['Checkout-Method'] === 'pickup'
              ? 'subdued'
              : 'transparent'
          }
          onPress={() => handleMethodSelect('pickup')}
        >
          <Text size="medium" emphasis="bold">
            Collection
          </Text>
        </Pressable>
        <Pressable
          // disabled={checkoutData?.methods?.delivery === false ? true : false}
          inlineAlignment={'center'}
          blockAlignment={'center'}
          cornerRadius={'base'}
          minBlockSize={50}
          border={'base'}
          background={
            attributes['Checkout-Method'] &&
            attributes['Checkout-Method'] !== 'pickup'
              ? 'subdued'
              : 'transparent'
          }
          onPress={() => handleMethodSelect('delivery')}
        >
          <Text size="medium" emphasis="bold">
            Delivery
          </Text>
        </Pressable>
      </InlineLayout>
      {attributes['Checkout-Method'] === 'pickup' && checkoutData?.pickup ? (
        <>
          {!!cs.status && (
            <CSPortal
              setCS={setCS}
              cs={cs}
              allLocations={checkoutData.pickup.qCollectLocations}
            />
          )}
          <Locations
            checkoutData={checkoutData}
            selectLocation={handleSelectPickupLocation}
            removeLocation={handleRemoveSelectedLocation}
            url={url}
            cart={lineItems}
            nextDay={nextDay}
            setProximityLocations={handleSetCollectLocations}
            setCS={setCS}
            localStorage={localStorage}
          />
        </>
      ) : attributes['Checkout-Method'] !== 'pickup' ? (
        <View padding={['tight', 'none', 'none', 'none']}>
          <Text emphasis="bold">
            Please enter your address to see delivery options.
          </Text>
        </View>
      ) : null}
    </>
  );
};

export default MethodSelect;
