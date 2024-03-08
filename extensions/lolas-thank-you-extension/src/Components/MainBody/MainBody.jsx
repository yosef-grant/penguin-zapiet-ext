import {
  BlockStack,
  Button,
  Divider,
  Form,
  Heading,
  Text,
  TextField,
  View,
  useBuyerJourneyCompleted,
  useEmail,
  useShippingAddress,
} from "@shopify/ui-extensions-react/checkout";
import React, { useState } from "react";
import AccountCreate from "./AccountCreate.jsx";
import Survey from "./Survey.jsx";

const MainBody = ({ url }) => {
  let orderComplete = useBuyerJourneyCompleted();

  const shippingAddress = useShippingAddress();
  const email = useEmail();

  console.log("current address: ", shippingAddress, "\nEmail: ", email);

  return (
    <View>

      <AccountCreate shippingAddress={shippingAddress} email={email} url={url}/>
      <Divider size="base" />
      <Survey url={url} email={email} shippingAddress={shippingAddress}/>
    </View>
  );
};

export default MainBody;
