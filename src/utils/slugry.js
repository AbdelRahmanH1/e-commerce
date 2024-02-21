export const slugary = (name) => {
  const arr = name.split(" ");
  let finalName = "";

  for (let i = 0; i < arr.length; i++) {
    finalName += arr[i];
    if (i < arr.length - 1) {
      finalName += "-";
    }
  }

  return finalName;
};
