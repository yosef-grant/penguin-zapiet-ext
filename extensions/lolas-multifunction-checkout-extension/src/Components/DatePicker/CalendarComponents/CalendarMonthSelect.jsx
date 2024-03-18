import { Select } from '@shopify/ui-extensions-react/checkout';
import { addMonths, format, isThisMonth } from 'date-fns';
import React from 'react';

const months = Array.apply(null, Array(13)).map(() => {});
const CalendarMonthSelect = ({ selectedMonth, setSelectedMonth, setToday }) => {
  const handleMonthChange = (value) => {
    setSelectedMonth(value);

    !isThisMonth(new Date(value))
      ? setToday(new Date(value))
      : setToday(new Date());
  };

  return (
    <Select
      label="Month"
      value={selectedMonth ? selectedMonth : format(new Date(), 'MMMM yyyy')}
      onChange={(val) => handleMonthChange(val)}
      options={months.map((month, i) => {
        if (i === 0) {
          return {
            key: { i },
            value: `${format(new Date(), 'MMMM yyyy')}`,
            label: `${format(new Date(), 'MMMM yyyy')}`,
          };
        } else {
          return {
            key: { i },
            value: `${format(addMonths(new Date(), i), 'MMMM yyyy')}`,
            label: `${format(addMonths(new Date(), i), 'MMMM yyyy')}`,
          };
        }
      })}
    />
  );
};

export default CalendarMonthSelect;
