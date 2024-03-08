// (TODO) handle "account already created"

import React, { useState } from "react";

import {
  BlockStack,
  Button,
  Divider,
  Form,
  Heading,
  Text,
  TextField,
  View,
  useCustomer,
} from "@shopify/ui-extensions-react/checkout";

const AccountCreate = ({ shippingAddress, email, url }) => {
  const [pw, setPW] = useState(null);
  const [error, setError] = useState(false);
  const [complete, setComplete] = useState({});
  const [fetching, setFetching] = useState(false);

  const customer = useCustomer();

  console.log(customer)

  const handleSubmit = async () => {
    setFetching(true);

    const reqBody = {
      fName: shippingAddress.firstName,
      lName: shippingAddress.lastName,
      email: email,
      password: pw,
      phone: shippingAddress.phone ? shippingAddress.phone : null,
    };

    if (!!pw) {
      let res = await fetch(`${url}/pza/checkout-account-create`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(reqBody),
      });

      let data = await res.json();

      if (!data.account_created) {
        setError(true);
      } else {
        data.error
          ? setComplete({ status: true, errors: true })
          : setComplete({ status: true, errors: false });
      }

      console.log(data);
      setFetching(false);
    }
  };

  return !customer ? (
    <>
      <Divider size="base" />
      {complete?.status ? (
        complete.errors ? (
          <>
            <Text>An account with this email already exists.</Text>
          </>
        ) : (
          <>
            <Text>
              Your account has been created! A confirmation email has been sent
              to {email}.
            </Text>
          </>
        )
      ) : (
        <>
          <Heading>CREATE A PASSWORD</Heading>
          <BlockStack>
            <Text>
              Create an account by adding a password below and collect your{" "}
              <Text emphasis="bold">Love Clube points</Text>
              <Form onSubmit={() => handleSubmit()}>
                <TextField
                  label="Enter a password"
                  onChange={(val) => setPW(val)}
                  onInput={() => {
                    !!error ? setError(false) : null;
                  }}
                />
                <Button accessibilityRole={"submit"} loading={fetching}>
                  CREATE
                </Button>
              </Form>
              <View>
                <Text
                  size="small"
                  emphasis={error ? "bold" : ""}
                  appearance={error ? "warning" : ""}
                >
                  Minimum 8 characters, including 1 numerical character (0-9)
                </Text>
              </View>
            </Text>
          </BlockStack>
        </>
      )}
    </>
  ) : null;
};

export default AccountCreate;
