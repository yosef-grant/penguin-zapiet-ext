import {
  Modal,
  Heading,
  Text,
  Button,
  InlineSpacer,
  InlineStack,
  Pressable,
  useApi,
  useBuyerJourneyIntercept,
  useStorage,
} from "@shopify/ui-extensions-react/checkout";
import { Grid, TextBlock, View } from "@shopify/ui-extensions/checkout";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import LockerCountdown from "./LockerCountdown.jsx";

const dateFormat = `EEEE, do MMMM yyyy`;

const LockerReserve = ({
  penguinCart,
  lockerReserved,
  setLockerReserved,
  reserveTime,
  setReserveTime,
  dateMatch,
  selected,
  attributes,
  changeAttributes,
  url,
  getPickupTime,
}) => {
  const { ui } = useApi();
  const [showReservationError, setShowReservationError] = useState(false);
  const [lockerLoading, setLockerLoading] = useState(false);
  const [lockerExpired, setLockerExpired] = useState(false);

  const localStorage = useStorage();

  

  useEffect(() => {
    const checkStorage = async () => {
      let y = await localStorage.read("locker_reservation");
      console.log("from local storage ", y);
      // * when the user reloads  page check if locker is reserved and/or expired
      let currentSecs = Date.now();

      if (y?.expiry) {
        const diff = Math.floor((y.expiry - currentSecs) / 1000);

        console.log(
          "HERES THE DIFF: ",
          diff,
          "\nexpiry time: ",
          y.expiry,
          "\ncurrentSecs: ",
          currentSecs
        );
        diff <= 1
          ? (setReserveTime(null),
            setLockerReserved(false),
            setLockerExpired(true))
          : (setReserveTime(y), setLockerReserved(true));
      } else {

        return;
      }
    };

    // * if lockerReserved, update Timer through state : update Timer from local storage
    checkStorage();
  }, []);

  useEffect(() => {

    console.log("locker expired is set to ", lockerExpired)
    if (lockerExpired) {
      let timer = setTimeout(() => {
        setLockerExpired(false);
      }, 2750);

      () => {
        clearTimeout(timer);
      }
    }

  }, [lockerExpired])

  console.log("IS LOCKER RESERVED? ", lockerReserved, reserveTime);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    return canBlockProgress && !lockerReserved
      ? {
          behavior: "block",
          reason: "No Locker Reserved",
          perform: (result) => {
            result.behavior === "block" ? setShowReservationError(true) : null;
          },
        }
      : {
          behavior: "allow",
          perform: () => {
            showReservationError ? setShowReservationError(false) : null;
          },
        };
  });

  const handleLockerReserve = async () => {
    const expiryTime = 0.2;
    setLockerLoading(true);
    let orderBody = {
      station_id: attributes["Pickup-Location-Id"],
      date: selected,
      reserve_status: lockerReserved,
      order_id: attributes["Pickup-Penguin-Id"]
        ? attributes["Pickup-Penguin-Id"]
        : null,
      cart: penguinCart,
    };

    let lockerRes = await fetch(`${url}/pza/confirm-delivery`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(orderBody),
    });

    let { data } = await lockerRes.json();

    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Penguin-Del-Code",
      value: data.delivery_code,
    });
    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Penguin-Pick-Code",
      value: data.picking_code,
    });
    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Penguin-Id",
      value: `${data.lockerID}`,
    });

    await changeAttributes({
      type: "updateAttribute",
      key: "Pickup-Penguin-Locker(s)",
      value: data.lockers,
    });

    !!lockerReserved &&
      (await changeAttributes({
        type: "updateAttribute",
        key: "Pickup-Date",
        value: selected,
      }),
      await changeAttributes({
        type: "updateAttribute",
        key: `Pickup-AM-Hours`,
        value: getPickupTime(selected, "am"),
      }),
      await changeAttributes({
        type: "updateAttribute",
        key: `Pickup-PM-Hours`,
        value: getPickupTime(selected, "pm"),
      }));

    setLockerReserved(true);
    // * adjust last digit to test
    setReserveTime({
      expiry: Date.now() + 1000 * 60 * expiryTime,
      date: selected,
    });
    await localStorage.write("locker_reservation", {
      expiry: Date.now() + 1000 * 60 * expiryTime,
      date: selected,
    });
    setLockerLoading(false);
    setShowReservationError(false);
    ui.overlay.close("reservation-confirm");
  };

  return (
    <View padding={["base", "none", "none", "none"]}>
      <Grid>
        <Button
          disabled={dateMatch ? true : false}
          overlay={
            <Modal id="reservation-confirm" padding={true}>
              <View inlineAlignment={"center"} blockAlignment="center">
                <Heading level={1}>
                  {!lockerReserved
                    ? "Confirm Reservation"
                    : "Change Reservation Date"}
                </Heading>
                <View
                  padding={["base", "none", "none", "none"]}
                  inlineAlignment={"center"}
                >
                  <TextBlock size="medium">
                    {lockerReserved && reserveTime?.date
                      ? `Would you like to switch from ${format(
                          new Date(reserveTime.date),
                          dateFormat
                        )} to ${format(new Date(selected), dateFormat)}?`
                      : `Do you wish to confirm your reservation for ${format(
                          new Date(selected),
                          dateFormat
                        )}?`}
                  </TextBlock>
                  <Text size="base">
                    (Locker will be held in reserve for 10 minutes)
                  </Text>
                  <View
                    padding={["base", "none", "base", "none"]}
                    blockAlignment="center"
                    inlineAlignment="center"
                  ></View>
                </View>
                <InlineStack spacing="base">
                  <Button
                    kind="secondary"
                    onPress={() => ui.overlay.close("reservation-confirm")}
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={() => handleLockerReserve()}
                    loading={lockerLoading}
                  >
                    Confirm
                  </Button>
                </InlineStack>
              </View>
            </Modal>
          }
        >
          {!dateMatch && !reserveTime?.expiry
            ? "Reserve Locker"
            : !dateMatch && reserveTime?.expiry
            ? "Change Reserved Date"
            : "Reserved"}
        </Button>
        <View>
          {lockerReserved && reserveTime?.expiry && (
            <LockerCountdown
              reserveTime={reserveTime}
              setReserveTime={setReserveTime}
              setLockerExpired={setLockerExpired}
              setLockerReserved={setLockerReserved}
              localStorage={localStorage}
            />
          )}
          {lockerExpired && (
            <Text>Locker has expired!</Text>
          )}
        </View>
      </Grid>
      {!!showReservationError && (
        <View
          position={{
            type: "absolute",
            inlineStart: 0,
            blockStart: `${110}%`,
          }}
        >
          <Text emphasis="bold" appearance="warning">
            Please reserve a locker to continue.
          </Text>
        </View>
      )}
    </View>
  );
};

export default LockerReserve;
