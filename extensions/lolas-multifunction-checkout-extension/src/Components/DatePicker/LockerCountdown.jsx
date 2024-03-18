import { Text } from "@shopify/ui-extensions-react/checkout";
import React, { useEffect, useState } from "react";

const LockerCountdown = ({
  reserveTime,
  setReserveTime,
  setLockerExpired,
  setLockerReserved,
  localStorage,
}) => {
  const [seconds, setSeconds] = useState(reserveTime.expiry);

  const currentSecs = Date.now();
  const diff = Math.floor((seconds - currentSecs) / 1000);
  useEffect(() => {
    const updateTimer = async () => {
      if ((seconds - currentSecs) / 1000 <= 1) {
        console.log("reservation should be set to expired");
        await localStorage.delete('locker_reservation');
        setReserveTime(null);
        setLockerReserved(false);
        setLockerExpired(true);
      } else {
        const timer = setInterval(() => {
          setSeconds((seconds) => seconds - 1);
        }, 1000);
        return () => clearInterval(timer);
      }
    };

    updateTimer();
    
  }, [seconds]);

  const getMins = () => {
    return Math.floor(diff / 60) < 10
      ? `0${Math.floor(diff / 60)}`
      : Math.floor(diff / 60);
  };

  const getSecs = () => {
    return diff % 60 < 10 ? `0${diff % 60}` : diff % 60;
  };

  return (
    <Text emphasis="bold" size="large">
      {getMins()}:{getSecs()} Remaining
    </Text>
  );
};

export default LockerCountdown;
