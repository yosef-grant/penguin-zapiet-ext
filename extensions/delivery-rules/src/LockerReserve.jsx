import {
  Modal,
  Heading,
  Text,
  Button,
  InlineSpacer,
  InlineStack,
  Pressable,
} from "@shopify/ui-extensions-react/checkout";
import { Grid, TextBlock, View } from "@shopify/ui-extensions/checkout";
import React from "react";

const LockerReserve = ({ handleLockerReserve, ui }) => {


  return (
    <View padding={["base", "none", "none", "none"]}>
      <Grid>
        <Button
          overlay={
            <Modal id="reservation-confirm" padding={true}>
              <View inlineAlignment={"center"} blockAlignment="center">
                <Heading level={1}>Confirm Reservation</Heading>
                <View padding={["base", "none", "none", "none"]} inlineAlignment={"center"}>
                  <TextBlock size="medium">
                    Do you wish to confirm your locker reservation?
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
                  <Button onPress={() => handleLockerReserve()}>Confirm</Button>
                </InlineStack>
              </View>
            </Modal>
          }
        >
          Reserve Locker
        </Button>
      </Grid>
    </View>
  );
};

export default LockerReserve;
