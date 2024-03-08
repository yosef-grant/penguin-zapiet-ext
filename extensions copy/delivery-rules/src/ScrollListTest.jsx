import {
  Button,
  Disclosure,
  Pressable,
  Text,
  TextBlock,
  View,
} from "@shopify/ui-extensions-react/checkout";

import { ScrollView } from "@shopify/ui-extensions/checkout";

import React, { useEffect, useState } from "react";

const ScrollListTest = () => {
  const testArr = [
    "barnet",
    "bexleyheath",
    "dorking",
    "brent cross",
    "ealing",
    "canary wharf",
    "putney",
    "victoria",
    "westfield",
  ];
  const [selected, setSelected] = useState(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollLevel, setScrollLevel] = useState(0);

  const [loading, setLoading] = useState(false);

  const handleOptionSelect = (elem, index) => {

    setScrollPos(index * 82);
    setSelectedIndex(index);
    setSelected(`${elem}-content`);

  };

  const scrollLog = (scrollEvent) => {
    console.log("Scrolling: ", scrollEvent.position.block, scrollPos);
  };

  //   useEffect(() => {
  //     console.log(
  //       "selected option changed: ",
  //       selected,
  //       "\nheres the scroll position: ",
  //       scrollPos
  //     );

  //     setScrollPos(selectedIndex * 78);
  //   }, [selectedIndex]);

//   useEffect(() => {
//     console.log("current scrollpos: ", scrollPos, typeof scrollPos);
//     setScrollLevel(scrollPos);
//   }, [scrollPos]);

  const changeScroll = (type) => {
    // if (type === "up") {
    //   setScrollPos(scrollPos - 80);
    // } else if (type === "down" && scrollPos < 720) {
    //   setScrollPos(scrollPos + 80);
    // }
    setScrollPos(scrollPos + 80);
    setLoading(false);
  };

  return (
    <>
      <Text>current scroll should be: {scrollPos}</Text>

      {!loading && (
        <ScrollView
          maxBlockSize={320}
          hint={{ type: "pill", content: "Scroll for more options" }}
          direction="block"
          scrollTo={scrollPos}
          onScroll={(scrollEvent) => scrollLog(scrollEvent)}
        >
          {testArr.map((testElem, i) => (
            <View minBlockSize={80} maxBlockSize={80} border={"base"}>
              <Pressable
                minInlineSize={`${100}%`}
                minBlockSize={80}
                toggles={`${testElem}-content`}
                onPress={() => handleOptionSelect(testElem, i)}
              >
                {testElem}
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
      <Button onPress={() => changeScroll("up")}>scroll up</Button>
      <Button onPress={() => changeScroll("down")}>scroll down</Button>
    </>
  );
};

export default ScrollListTest;
