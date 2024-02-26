import {
  Checkbox,
  TextField,
  View,
  useApplyAttributeChange,
  useApplyNoteChange,
  useAttributeValues,
  useNote,
  Heading,
  BlockLayout,
  reactExtension,
} from "@shopify/ui-extensions-react/checkout";
import React, { useState } from "react";

export default reactExtension(
  "purchase.checkout.shipping-option-list.render-before",
  () => <DeliveryInstructions />
);

const DeliveryInstructions = () => {
  const changeAttr = useApplyAttributeChange();
  const currentMethod = useAttributeValues(["Checkout-Method"])[0];
  const giftNote = useAttributeValues(["Gift-Note"])[0];
  const changeNote = useApplyNoteChange();
  const currentNote = useNote();

  const [gNoteVisible, setGNoteVisible] = useState(
    giftNote && giftNote !== "" ? true : false
  );
  // console.log(
  //   "method from note: ",
  //   currentMethod,
  //   currentNote,
  //   "\nGift note: ",
  //   giftNote,
  //   "\nis note visible? ",
  //   gNoteVisible
  // );


  const handleNoteChange = async (val) => {
    console.log("heres the note value: ", val);
    await changeNote({
      type: "updateNote",
      note: val,
    });
  };

  const handleNoteInput = async (val) => {
    if (!val && currentNote) {
      await changeNote({
        type: "removeNote",
      });
    }
  };

  const handleChkbxChange = async () => {
    setGNoteVisible(!gNoteVisible);
    if (giftNote) {
      await changeAttr({
        type: "updateAttribute",
        key: "Gift-Note",
        value: "",
      });
    }
  };

  const handleMessageChange = async (val) => {
    await changeAttr({
      type: "updateAttribute",
      key: "Gift-Note",
      value: val,
    });
  };

  const handleMessageInput = async (val) => {
    if (!val && giftNote) {
      await changeAttr({
        type: "updateAttribute",
        key: "Gift-Note",
        value: "",
      });
    }
  };

  return (
    <>
      {currentMethod !== "pickup" && (
        <TextField
          label="Safe place instructions"
          onChange={(val) => handleNoteChange(val)}
          onInput={(val) => handleNoteInput(val)}
        />
      )}

      <View
        padding={[
          `${currentMethod === "pickup" ? "base" : "loose"}`,
          "none",
          "none",
          "none",
        ]}
      >
        <Heading level={1}>Gift Note</Heading>
        <View padding={["tight", "none", "extraTight", "none"]}>
          <BlockLayout spacing={"base"} rows={["auto", "auto"]}>
            <Checkbox onChange={() => handleChkbxChange()} value={gNoteVisible}>
              Add a free gift note
            </Checkbox>
            {gNoteVisible && (
              <TextField
                label="Gift Note Message"
                name="gift-note"
                onChange={(val) => handleMessageChange(val)}
                onInput={(val) => handleMessageInput(val)}
                value={giftNote}
              />
            )}
          </BlockLayout>
        </View>
      </View>
    </>
  );
};
