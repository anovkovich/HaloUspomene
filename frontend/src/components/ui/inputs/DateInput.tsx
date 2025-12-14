import React from "react";
import Input from "./Input"; // Reusing your existing Input component

// We omit 'type' because we force it to be 'date'
// interface DateInputProps
//   extends Omit<React.ComponentProps<typeof Input>, "type" | "prefix"> {
//   // You can add specific props here if needed
// }
type DateInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "prefix"
>;

export default function DateInput({
  className = "",
  ...props
}: DateInputProps) {
  return (
    <Input
      type="date"
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
