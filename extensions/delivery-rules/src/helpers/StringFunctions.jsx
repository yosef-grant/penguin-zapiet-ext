const capitalise = (str) => {
    const first = str.charAt(0).toUpperCase();
    const r = str.slice(1, str.length);
    return `${first}${r}`;
  };


  export {capitalise}