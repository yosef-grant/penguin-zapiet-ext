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
  // The message to be added to the delivery option
  const message = "May be delayed due to weather conditions";

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
  let total = input.cart.cost.totalAmount.amount;

  const getOptions = (deliveryOptions, deliveryType, zone) => {
    console.log("heres the zone: ", zone);
    let r = [];
    deliveryOptions.forEach((option) => {
      if (!zone || zone === null) {
        !option.title.toLowerCase().includes(deliveryType)
          ? r.push(option)
          : null;
      } else {
        !option.title.toLowerCase().includes(`group ${zone}`)
          ? r.push(option)
          : null;
      }
    });
    return r;
  };

  let y = [];
  input.cart.deliveryGroups.forEach((group) => {
    group.deliveryOptions.forEach((option) => {
      option.title?.toLowerCase() !== "dynamic rate" ? y.push(option) : null;
    });
  });

  let hideAll = y

    // * Collect all delivery groups
    // .flatMap((group) => group.deliveryOptions)
    // * Construct a HIDE operation for each
    .map((option) =>
      /* @type {Operation} */
      ({
        hide: {
          deliveryOptionHandle: option.handle,
        },
      })
    );

  let x = [];
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
  console.log("heres the delivery string: ", deliveryAttr?.value, deliveryStr);
  input.cart.deliveryGroups.forEach((group) =>
    x.push(
      getOptions(
        group.deliveryOptions,
        searchTerm,
        deliveryStr.length > 1 ? deliveryStr[1] : null
      )
    )
  );

  // console.log("HeRES X : ", JSON.stringify(x));

  let showDelivery = x[0].map((option) => ({
    hide: {
      deliveryOptionHandle: option.handle,
    },
  }));

  // The @shopify/shopify_function package applies JSON.stringify() to your function result
  // and writes it to STDOUT
  return {
    //operations: []
    //operations: input.cart.attribute?.value === 'delivery' ? [] : hideAll,

    // ? using the price as a lever works
    operations:
      //parseInt(total) <= 25 &&
      //deliveryAttr?.value === 'testing' ? showDelivery : hideAll,
      deliveryAttr?.value ? showDelivery : hideAll,
  };
}
