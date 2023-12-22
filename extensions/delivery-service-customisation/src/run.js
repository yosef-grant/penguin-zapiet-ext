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
    "heres the attribue: ",
    JSON.stringify(input.cart),
    input.cart.lines[0].attribute
  );
  let deliveryAttr = input.cart.lines[0].attribute;

  let hideAll = input.cart.deliveryGroups
    // * Collect all delivery groups
    .flatMap((group) => group.deliveryOptions)
    // * Construct a HIDE operation for each
    .map((option) => /* @type {Operation} */ ({
      hide: {
        deliveryOptionHandle: option.handle,
      },
    }));

  // The @shopify/shopify_function package applies JSON.stringify() to your function result
  // and writes it to STDOUT
  return {
    //operations: []
    operations: deliveryAttr?.value ? [] : hideAll,
  };
}
