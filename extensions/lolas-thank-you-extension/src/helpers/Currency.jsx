const currency = (value) => {


    const currencyFormat = (x) => {
      let formattedInt = new Intl.NumberFormat("en-GP", {
        style: "currency",
        currency: "GBP",
      }).format(parseFloat(x) / 100);
      return formattedInt;
    };
    return currencyFormat(value);
  };

  export default currency;
  