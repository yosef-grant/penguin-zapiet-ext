import { Text, useStorage } from "@shopify/ui-extensions-react/checkout";
import React, { useEffect, useState } from "react";

const LockerCountdownAux = () => {
  const localStorage = useStorage();

  const [seconds, setSeconds] = useState(null);
  const [lockerInfoFromStorage, setLockerInfoFromStorage] = useState(null);

  useEffect(() => {
    const checkStorage = async () => {
      const t = await localStorage.read("locker_reservation");

      t ? (setLockerInfoFromStorage(t), setSeconds(t.expiry)) : null;
    };
    checkStorage();
  }, []);

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
    return diff % 60 < 10 ? `0${diff % 60}` : diff % 60;
  };

  return lockerInfoFromStorage ? (
    <Text emphasis="bold" size="large">
      {getMins()}:{getSecs()} Remaining
    </Text>
  )
  : null;
  ;
};

export default LockerCountdownAux;
