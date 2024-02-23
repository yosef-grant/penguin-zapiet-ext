// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  // let toRename = input.cart.deliveryGroups
  //   // Filter for delivery groups with a shipping address containing the affected state or province
  //   .filter(group => group.deliveryAddress?.provinceCode &&
  //     group.deliveryAddress.provinceCode == "ENG")
  //   // Collect the delivery options from these groups
  //   .flatMap(group => group.deliveryOptions)
  //   // Construct a rename operation for each, adding the message to the option title
  //   .map(option => /* @type {Operation} */({
  //     rename: {
  //       deliveryOptionHandle: option.handle,
  //       title: option.title ? `${option.title} - ${message}` : message
  //     }
  //   }));

  console.log(
    "heres the total: ",
    input.cart.cost.totalAmount.amount,
    "heres the attribute: ",
    input.cart.lines[0].attribute?.value,
    "heres the cart attributes: ",
    input.cart.attribute
  );
  let deliveryAttr = input.cart.lines[0].attribute;

  //  const getOptions = (deliveryOptions, deliveryType, zone) => {
  //    console.log("heres the zone: ", zone);
  //    let r = [];
  //    deliveryOptions.forEach((option) => {
  //      if (!zone || zone === null) {
  //        !option.title.toLowerCase().includes(deliveryType)
  //          ? r.push(option)
  //          : null;
  //      } else {
  //        !option.title.toLowerCase().includes(`group ${zone}`)
  //          ? r.push(option)
  //          : null;
  //      }
  //    });
  //    return r;
  //  };

  const getRename = (title, type) => {
    let x;
    if (type === "delivery") {
      x = title.replace(/[^\)]*$/gm, "");
    } else if (type === "pickup") {
      x = title.replace(/\s\[.*/gm, "");
    } else x = title;
    return x;
  };

  const getActionObj = (deliveryOptions, deliveryType, zone) => {
    let t = deliveryOptions.reduce((acc, option, index) => {
      option.title
        .toLowerCase()
        .includes(!zone || zone === null ? deliveryType : `group ${zone}`)
        ? (acc[index] = {
            remove: false,
            title: option.title,
            handle: option.handle,
            new_title: getRename(option.title, deliveryType),
          })
        : (acc[index] = {
            remove: true,
            title: option.title,
            handle: option.handle,
          });
      return acc;
    }, {});
    return t;
  };

  if (deliveryAttr?.value) {
    let y = [];
    input.cart.deliveryGroups.forEach((group) => {
      group.deliveryOptions.forEach((option) => {
        option.title?.toLowerCase() !== "dynamic rate" ? y.push(option) : null;
      });
    });

    let hideAll = y;

    let searchTerm;

    let deliveryStr =
      deliveryAttr?.value.length === 1
        ? deliveryAttr?.value
        : deliveryAttr?.value.split("%");

    switch (deliveryStr[0]) {
      case "D":
        searchTerm = "delivery";
        break;
      case "P":
        searchTerm = "pickup";
        break;
      // ! change for live
      case "S":
        searchTerm = "standard";
        break;
      case "U":
        searchTerm = "unavailable";
    }
    console.log(
      "heres the delivery string: ",
      deliveryAttr?.value,
      deliveryStr
    );

    let p = getActionObj(
      input.cart.deliveryGroups[0].deliveryOptions,
      searchTerm,
      deliveryStr.length > 1 ? deliveryStr[1] : null
    );

    let showDelivery = Object.keys(p).map((key) => {
      if (p[key].remove === true) {
        return {
          hide: {
            deliveryOptionHandle: p[key].handle,
          },
        };
      } else
        return {
          rename: {
            deliveryOptionHandle: p[key].handle,
            title: p[key].new_title,
          },
        };
    });

    return {
      // operations: deliveryAttr?.value ? showDelivery : hideAll,
      operations: showDelivery 
    };
  } else {
    return {
      operations: [],
    };
  }

  // let y = [];
  // input.cart.deliveryGroups.forEach((group) => {
  //   group.deliveryOptions.forEach((option) => {
  //     option.title?.toLowerCase() !== "dynamic rate" ? y.push(option) : null;
  //   });
  // });

  // let hideAll = y
  // * Collect all delivery groups
  // .flatMap((group) => group.deliveryOptions)
  // * Construct a HIDE operation for each
  // .map((option) =>
  //   /* @type {Operation} */
  //   ({
  //     hide: {
  //       deliveryOptionHandle: option.handle,
  //     },
  //   })
  // );

  // The @shopify/shopify_function package applies JSON.stringify() to your function result
  // and writes it to STDOUT
  // return {
  //   operations: [],
  //   //operations: input.cart.attribute?.value === 'delivery' ? [] : hideAll,

  //   // ? using the price as a lever works
  //   //operations:
  //   //parseInt(total) <= 25 &&
  //   //deliveryAttr?.value === 'testing' ? showDelivery : hideAll,
  //   // * WORKING CODE
  //   //deliveryAttr?.value ? showDelivery : hideAll,
  // };
}
