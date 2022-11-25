export const styles = {
  option: (styles, { isFocused, isSelected, isDisabled }) => ({
    ...styles,
    backgroundColor: isDisabled
      ? null
      : isSelected
      ? "#fdd0d5"
      : isFocused
      ? "#fee8eb"
      : null,
    color: isSelected ? "black" : "black",
    ":active": {
      ...styles[":active"],
      backgroundColor: !isDisabled && (isSelected ? "#fee8eb" : "#fdd0d5"),
    },
  }),
};
