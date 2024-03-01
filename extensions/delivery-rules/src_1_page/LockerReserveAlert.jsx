import {
  Banner,
  InlineLayout,
  Text,
  View,
} from '@shopify/ui-extensions-react/checkout';
import React from 'react';
import LockerCountdown from './LockerCountdown.jsx';

const LockerReserveAlert = ({ reserveTime }) => {
  return (
    <View padding={['tight', 'none', 'none', 'none']}>
      <Banner status="success">
        <View
          blockAlignment={'start'}
          inlineAlignment={'start'}
          display="inline"
          minInlineSize={'fill'}
        >
          <InlineLayout columns={[`${50}%`, `${50}%`]} minInlineSize={'fill'}>
            <View>
              <Text>Locker reserved successfully!</Text>
            </View>
            <View inlineAlignment="end">
              <LockerCountdown reserveTime={reserveTime} />
            </View>
          </InlineLayout>
        </View>
      </Banner>
    </View>
  );
};

export default LockerReserveAlert;
