import { Text, TextBlock } from '@shopify/ui-extensions-react/checkout';
import { addDays, format, isSameDay } from 'date-fns';
import React from 'react';

const CalendarLocationInfo = ({
  selected,
  minDate,
  locationHours,
  attributes,
  getPickupTime,
}) => {
  console.log(
    'from locationinfo - mindate: ',
    minDate,
    '\nselected: ',
    selected
  );

  const isNextDay = () => {
    let date = selected ? selected : minDate;
    let check = isSameDay(new Date(date), addDays(new Date(), 1));
    return check;
  };

  return (
    <TextBlock>
      On{' '}
      <Text emphasis="bold">
        {format(new Date(selected ? selected : minDate), 'EEEE')}{' '}
      </Text>
      the{' '}
      <Text>
        {attributes['Pickup-Location-Type'] === 'lockers' ? 'locker' : 'store'}{' '}
      </Text>
      opening hours are{' '}
      <Text emphasis="bold">
        {
          locationHours[
            `${format(
              new Date(selected ? selected : minDate),
              'EEEE'
            ).toLowerCase()}_opening_hours`
          ]
        }
      </Text>
      .{' '}
      <Text>
        Your order will be ready to collect from{' '}
        <Text emphasis="bold">
          {isNextDay()
            ? getPickupTime(selected ? selected : minDate, 'pm')
            : getPickupTime(selected ? selected : minDate, 'am')}
        </Text>
        .
      </Text>
    </TextBlock>
  );
};

export default CalendarLocationInfo;
