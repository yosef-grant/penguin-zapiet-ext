import { Heading, Button, useStorage } from '@shopify/ui-extensions-react/checkout';

const TestQC = () => {

    const storage = useStorage();
    
    const handleSelect = async()=> {
      
        await storage.write('path', 'quick-collect');
    }

    const handleDeselect = async() => {
        console.log('deselecting quick collect')
        await storage.delete('path');
    }

  return (
    <>
      <Heading>
        This is the test Quick Collect Component. Clicking the buttons in this
        component should nullify the one in the Method Select
      </Heading>
      <Button onPress={() => handleSelect()}>Click to Select Quick Collect</Button>
      <Button onPress={() => handleDeselect()}>Click to De-select Quick Collect</Button>
    </>
  );
};

export default TestQC;
