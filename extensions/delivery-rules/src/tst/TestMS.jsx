import {
  Heading,
  Button,
  useStorage,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';

const TestMS = () => {
  const [disableComponent, setDisableComponent] = useState(false);

  const storage = useStorage();
  
  useEffect(() => {
    console.log(storage)
    const checkStorage = async () => {
        let storedPath = await storage.read('path');
   
        console.log('rendering method select!');
      storedPath && storedPath === 'quick-collect'
        ? setDisableComponent(true)
        : !storedPath && disableComponent
        ? setDisableComponent(false)
        : null;
    };
    checkStorage();
  }, [storedPath]);
  return (
    <>
      <Heading>
        This is the test Method Select Component. Clicking the buttons in this
        component should impact the one in the Quick Collect
      </Heading>
      <Button disabled={disableComponent ? true : false}>
        Click to Select Method Select
      </Button>
      <Button disabled={disableComponent ? true : false}>
        Click to De-select Method Select
      </Button>
    </>
  );
};

export default TestMS;
