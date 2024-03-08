import {
  BlockStack,
  Button,
  Choice,
  ChoiceList,
  Form,
  Heading,
  InlineStack,
  Text,
  TextField,
  View,
} from "@shopify/ui-extensions-react/checkout";
import { BlockLayout } from "@shopify/ui-extensions/checkout";
import React, { useState } from "react";

const ratingVals = ["1", "2", "3", "4", "5"];

const Survey = ({ url, email, shippingAddress }) => {
  const [rating, setRating] = useState("3");
  const [feedback, setFeeback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    let res = await fetch(`${url}/pza/submit-feedback`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        rating: rating,
        comment: feedback,
        email: email,
        name: {
          first_name: shippingAddress.firstName,
          surname: shippingAddress.lastName,
        },
      }),
    });
    let data = await res.json();
    console.log(data);
    data.received ? setSubmitted(true) : null;
    console.log("form submitted!", rating, feedback);
    setLoading(false);
  };

  return (
    <View>
      <Heading>How was your online shopping experience?</Heading>
      {!submitted ? (
        <Form onSubmit={() => handleSubmit()}>
          <ChoiceList
            name="feedback-rating"
            variant="base"
            value={rating}
            onChange={(value) => setRating(value)}
          >
            <InlineStack padding={["base", "none", "base", "none"]}>
              {ratingVals.map((val, i, arr) => (
                <BlockLayout
                  inlineAlignment={"center"}
                  spacing={"none"}
                  blockAlignment="start"
                  rows={["fill", "fill", "fill"]}
                >
                  <View minInlineSize={50} inlineAlignment={"center"}>
                    {i === 0 ? (
                      <Text>Bad</Text>
                    ) : i === arr.length - 1 ? (
                      <Text>Good</Text>
                    ) : null}
                  </View>
                  <Choice id={val} />
                  <Text>{val}</Text>
                </BlockLayout>
              ))}
            </InlineStack>
          </ChoiceList>
          <View>
            <TextField
              label="Any thoughts?"
              multiline={5}
              onChange={(val) => setFeeback(val)}
            />
          </View>
          <Button accessibilityRole="submit" loading={loading}>
            Submit
          </Button>
        </Form>
      ) : (
        <Text>Thank you for your feedback!</Text>
      )}
    </View>
  );
};

export default Survey;
