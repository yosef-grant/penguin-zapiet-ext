import {
  Heading,
  Button,
  useStorage,
  useAttributes,
  useApplyAttributeChange,
  useAttributeValues,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

const TestMS = () => {
  const [disabled, setDisabled] = useState(false);
  const attributes = useAttributes();

  let changeAttributes = useApplyAttributeChange();




  const handleSelect = async () => {
    await changeAttributes({
      type: "updateAttribute",
      key: "testing",
      value: "method-select",
    });
  };

  let pathway = useAttributeValues(["testing"]);
  console.log("Method Select has been rendered!: ", pathway);



  useEffect(() => {
    pathway[0] === "quick-collect"
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
        This is the test Method Select Component. Clicking the buttons in this
        component should impact the one in the Quick Collect
      </Heading>
      <Button
        onPress={() => handleSelect()}
        disabled={disabled ? true : false}
      >
        Click to Select Method Select
      </Button>
      <Button disabled={disabled ? true : false} onPress={() => handleDeselect()}>
        Click to De-select Method Select
      </Button>
    </>
  );
};

export default TestMS;
