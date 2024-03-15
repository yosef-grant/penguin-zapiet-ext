import {
    View,
    Heading,
    Select,
    TextField,
  } from '@shopify/ui-extensions/checkout';
  
  import {
    Button,
    Modal,
    useApi,
    Form,
    useApplyAttributeChange,
    Grid,
    InlineStack,
  } from '@shopify/ui-extensions-react/checkout';
  import { useEffect } from 'react';
  
  const CSPortal = ({ setCS, cs, allLocations }) => {
    useEffect(() => {
      console.log('allLocations', allLocations);
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
        type: 'updateAttribute',
        key: 'Lolas-CS-Member',
        value: x,
      });
      await changeAttributes({
        type: 'updateAttribute',
        key: 'Customer-Service-Note',
        value: cs.note,
      });
      ui.overlay.close('cs-portal');
    };
  
    return (
      <>
        <Grid padding={['base', 'none', 'base', 'none']}>
          <Button
            overlay={
              <Modal id="cs-portal" padding={true}>
                <Form onSubmit={() => handleFormSubmit()} id="cs-form">
                  <View padding={['loose', 'none', 'loose', 'none']}>
                    <Heading level={1}>Customer Service Portal</Heading>
                    <View padding={['tight', 'none', 'tight', 'none']}>
                      <Select
                        label="Customer Service Location"
                        value={cs.location ? cs.location.id : ''}
                        options={allLocations
                          .filter(
                            (location) =>
                              location.custom_attribute_1 !== 'lockers'
                          )
                          .map((filteredLocation, i) => ({
                            key: `${filteredLocation.id}${i}`,
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
                    </View>
                    <View padding={['tight', 'none', 'tight', 'none']}>
                      <TextField
                        label="Customer Service Name"
                        value={cs?.name ? cs.name : ''}
                        onChange={(val) =>
                          setCS((cs) => {
                            return { ...cs, name: val };
                          })
                        }
                      ></TextField>
                    </View>
                    {(!!cs?.name || !!cs?.location) && (
                      <View padding={['tight', 'none', 'tight', 'none']}>
                        <TextField
                          label="Customer Service Note"
                          onChange={(val) =>
                            setCS((cs) => {
                              return { ...cs, note: val };
                            })
                          }
                          value={!!cs.note ? cs.note : ''}
                        ></TextField>
                      </View>
                    )}
                    <View padding={["base", "none", "none", "none"]} inlineAlignment={"center"}>
                      <InlineStack spacing={'base'}>
                        <Button
                          kind="secondary"
                          onPress={() => ui.overlay.close('cs-portal')}
                        >
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
                      </InlineStack>
                    </View>
                  </View>
                </Form>
              </Modal>
            }
          >
            Add Customer Service Note
          </Button>
        </Grid>
      </>
    );
  };
  
  export default CSPortal;
  