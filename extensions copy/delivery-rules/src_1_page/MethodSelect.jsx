import React, { useState } from "react";
import {
  Banner,
  Button,
  Divider,
  Heading,
  InlineLayout,
  Pressable,
  Spinner,
  Text,
  View,
} from "@shopify/ui-extensions-react/checkout";
import CSPortal from "./CSPortal.jsx";
import Locations from "./Locations.jsx";

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
  availableMethods,
  localStorage,
  noDelivery,
  showDeliveryError,
  currentShippingAddress,
  checkingPostcode,
}) => {
  console.log("METHOD SELECT : DELIVERY BLOCKED? ", noDelivery);


  const [methodHover, setMethodHover] = useState(false);
  
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
      <InlineLayout
        spacing={"tight"}
        padding={["base", "none", "none", "none"]}
      >
        {attributes["Checkout-Method"] === "pickup" ? (
          <>
            <Button>Collection</Button>
            <Pressable
              inlineAlignment={"center"}
              blockAlignment={"center"}
              cornerRadius={"base"}
              onPointerEnter={() => setMethodHover(true)}
              onPointerLeave={() => setMethodHover(false)}
              minBlockSize={50}
              border={"base"}
              background={
              methodHover
                  ? "subdued"
                  : "transparent"
              }
              onPress={
                attributes["Checkout-Method"] !== "delivery"
                  ? () => handleMethodSelect("delivery", availableMethods)
                  : null
              }
            >
              <Text size="medium" emphasis="bold">
                Delivery
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              inlineAlignment={"center"}
              blockAlignment={"center"}
              cornerRadius={"base"}
              onPointerEnter={() => setMethodHover(true)}
              onPointerLeave={() => setMethodHover(false)}
              minBlockSize={50}
              border={"base"}
              background={
              methodHover
                  ? "subdued"
                  : "transparent"
              }
              onPress={
                attributes["Checkout-Method"] !== "pickup"
                  ? () => handleMethodSelect("pickup", availableMethods)
                  : null
              }
            >
              <Text size="medium" emphasis="bold">
                Collection
              </Text>
            </Pressable>

            <Button>Delivery</Button>
          </>
        )}
{/* 
        <Pressable
          // disabled={checkoutData?.methods?.pickup === false ? true : false}
          inlineAlignment={"center"}
          blockAlignment={"center"}
          cornerRadius={"base"}
          minBlockSize={50}
          border={"base"}
          background={
            attributes["Checkout-Method"] &&
            attributes["Checkout-Method"] === "pickup"
              ? "subdued"
              : "transparent"
          }
          onPress={
            attributes["Checkout-Method"] !== "pickup"
              ? () => handleMethodSelect("pickup", availableMethods)
              : null
          }
        >
          <Text size="medium" emphasis="bold">
            Collection
          </Text>
        </Pressable>
        <Pressable
          // disabled={checkoutData?.methods?.delivery === false ? true : false}
          inlineAlignment={"center"}
          blockAlignment={"center"}
          cornerRadius={"base"}
          minBlockSize={50}
          border={"base"}
          background={
            attributes["Checkout-Method"] &&
            attributes["Checkout-Method"] !== "pickup"
              ? "subdued"
              : "transparent"
          }
          onPress={
            attributes["Checkout-Method"] !== "delivery"
              ? () => handleMethodSelect("delivery", availableMethods)
              : null
          }
        >
          <Text size="medium" emphasis="bold">
            Delivery
          </Text>
        </Pressable> */}
      </InlineLayout>
      {attributes["Checkout-Method"] === "pickup" && checkoutData?.pickup ? (
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
            currentShippingAddress={currentShippingAddress}
            attributes={attributes}
          />
        </>
      ) : attributes["Checkout-Method"] !== "pickup" ? (
        <View
          padding={["tight", "none", "none", "none"]}
          inlineAlignment={"center"}
        >
          {!!showDeliveryError || !!noDelivery ? (
            <View
              minInlineSize={"fill"}
              padding={["tight", "none", "none", "none"]}
            >
              <Banner status="warning">
                <Text size="base" emphasis="bold">
                  Delivery is not available for this address. Try an alternative
                  address or{" "}
                  <Button
                    kind="plain"
                    onPress={() =>
                      handleMethodSelect("pickup", availableMethods)
                    }
                  >
                    <Text>switch to collection</Text>
                  </Button>
                </Text>
              </Banner>
              {/* <Text size="base" emphasis="bold">
                Delivery is not available for your address.{" "}
                <Button kind="link">
                  <Text emphasis="italic">Switch to collection?</Text>
                </Button>
              </Text> */}
            </View>
          ) : (
            <>
              {!checkingPostcode ? (
                <>
                  <Text emphasis="bold" size="base">
                    Enter delivery address below
                  </Text>
                </>
              ) : (
                <>
                  <Text emphasis="bold" size="base">
                    Checking address...
                  </Text>
                  <View padding={["tight", "none", "none", "none"]}>
                    <Spinner></Spinner>
                  </View>
                </>
              )}
            </>
          )}
        </View>
      ) : null}
    </>
  );
};

export default MethodSelect;
