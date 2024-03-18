import { Text } from "@shopify/ui-extensions-react/checkout";
import React, { useEffect, useState } from "react";

const LockerCountdown = ({reserveTime}) => {

    console.log('from locker reserve: ', reserveTime)
  const [seconds, setSeconds] = useState(reserveTime.expiry);

  const currentSecs = Date.now();
  const diff = Math.floor((seconds - currentSecs) / 1000);
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const getMins = () => {
    return Math.floor(diff / 60) < 10
      ? `0${Math.floor(diff / 60)}`
      : Math.floor(diff / 60);
  };

  const getSecs = () => {
    return diff % 60 < 10 ? `0${diff % 60}` : diff % 60 ;
  };

  return (
    <Text emphasis="bold" size="large">
      {getMins()}:{getSecs()} Remaining
    </Text>
  );
};

export default LockerCountdown;
