import {
  View,
  Heading,
  Select,
  TextField,
} from "@shopify/ui-extensions/checkout";

import {
  Button,
  Modal,
  useApi,
  Text,
  useAttributes,
  Form,
  useApplyAttributeChange,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

const CSPortal = ({ setCS, cs, allLocations }) => {
  useEffect(() => {
    console.log("allLocations", allLocations);
  }, []);
  const { ui } = useApi();

  let changeAttributes = useApplyAttributeChange();
  const handleFormSubmit = async () => {
    let x =
      cs?.location && cs?.name
        ? `${cs.location.company_name}: ${cs.name}`
        : cs?.location
        ? cs.location.company_name
        : cs.name;

    await changeAttributes({
      type: "updateAttribute",
      key: "Lolas-CS-Member",
      value: x,
    });
    await changeAttributes({
      type: "updateAttribute",
      key: "Customer-Service-Note",
      value: cs.note,
    });
    ui.overlay.close("cs-portal");
  };

  return (
    <>
      <Button
        overlay={
          <Modal id="cs-portal" padding={true}>
            <Form onSubmit={() => handleFormSubmit()} id="cs-form">
              <View padding={["loose", "none", "loose", "none"]}>
                <Heading>Customer Service Portal</Heading>
                <Select
                  label="Customer Service Location"
                  value={cs.location ? cs.location.id : ""}
                  options={allLocations
                    .filter(
                      (location) => location.custom_attribute_1 !== "lockers"
                    )
                    .map((filteredLocation) => ({
                      value: filteredLocation.id,
                      label: filteredLocation.company_name,
                    }))}
                  onChange={(value) =>
                    setCS((cs) => {
                      return {
                        ...cs,
                        location: allLocations.filter(
                          (x) => x.id === parseInt(value)
                        )[0],
                      };
                    })
                  }
                />
                <TextField
                  label="Customer Service Name"
                  value={cs?.name ? cs.name : ""}
                  onChange={(val) =>
                    setCS((cs) => {
                      return { ...cs, name: val };
                    })
                  }
                ></TextField>
                {(!!cs?.name || !!cs?.location) && (
                  <TextField
                    label="Customer Service Notes"
                    onChange={(val) =>
                      setCS((cs) => {
                        return { ...cs, note: val };
                      })
                    }
                    value={!!cs.note ? cs.note : ""}
                  ></TextField>
                )}
                <Button onPress={() => ui.overlay.close("cs-portal")}>
                  Cancel
                </Button>
                <Button
                  accessibilityRole="submit"
                  disabled={
                    (!cs?.name && !cs?.location) ||
                    ((!!cs?.name || !!cs?.location) && !cs.note)
                      ? true
                      : false
                  }
                >
                  Confirm
                </Button>
              </View>
            </Form>
          </Modal>
        }
      >
        Add Customer Service Note
      </Button>
    </>
  );
};

export default CSPortal;
