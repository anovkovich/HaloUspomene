import React from "react";
import Input from "./Input";

// interface TimeInputProps
//   extends Omit<React.ComponentProps<typeof Input>, "type" | "prefix"> {
//   // You can add specific props here if needed
// }
type TimeInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "prefix"
>;

export default function TimeInput({
  className = "",
  ...props
}: TimeInputProps) {
  return (
    <Input
      type="time"
      className={`
        [&::-webkit-calendar-picker-indicator]:cursor-pointer
        [&::-webkit-calendar-picker-indicator]:opacity-60
        [&::-webkit-calendar-picker-indicator]:hover:opacity-100
        ${className}
      `}
      {...props}
    />
  );
}
