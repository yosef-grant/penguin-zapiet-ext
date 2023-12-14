import {
  Heading,
  Button,
  useStorage,
  useAttributes,
  useApplyAttributeChange,
  useAttributeValues,
} from "@shopify/ui-extensions-react/checkout";
import { useState, useEffect } from "react";


const TestQC = () => {
  const storage = useStorage();
  const attributes = useAttributes();

  let changeAttributes = useApplyAttributeChange();

  const handleSelect = async () => {
    // await storage.write('path', 'quick-collect');
    await changeAttributes({
      type: "updateAttribute",
      key: "testing",
      value: "quick-collect",
    });
  };

  const [disabled, setDisabled] = useState(false);

  let pathway = useAttributeValues(["testing"]);
  console.log("Quick Collect has been rendered!: ", pathway);
  
  useEffect(() => {
    pathway[0] === "method-select"
      ? setDisabled(true)
      : !pathway[0] && disabled
      ? setDisabled(false)
      : null;
  }, [attributes]);

  const handleDeselect = async () => {
    console.log("deselecting quick collect");
    await changeAttributes({
      type: "updateAttribute",
      key: "testing",
      value: "",
    });
  };

  return (
    <>
      <Heading>
        This is the test Quick Collect Component. Clicking the buttons in this
        component should nullify the one in the Method Select
      </Heading>
      <Button onPress={() => handleSelect()} disabled={disabled ? true : false}>
        Click to Select Quick Collect
      </Button>
      <Button
        onPress={() => handleDeselect()}
        disabled={disabled ? true : false}
      >
        Click to De-select Quick Collect
      </Button>
    </>
  );
};

export default TestQC;
