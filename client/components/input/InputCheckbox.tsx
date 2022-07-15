import React, { useState } from "react";

export type Props = {
  name: string;
  label?: string;
  checked?: boolean;
  onCheckChanged?: (isChecked: boolean) => void;
};
export default function InputCheckbox(props: Props) {
  const [isChecked, setIsChecked] = useState(props.checked || false);

  const onChange = (event: any) => {
    setIsChecked(event.target.checked);
    if (props.onCheckChanged) {
      props.onCheckChanged(event.target.checked);
    }
  };

  return (
    <label htmlFor={`${props.name}Checkbox`}>
      <input
        id={`${props.name}Checkbox`}
        type="checkbox"
        onChange={onChange}
        checked={isChecked}
      />
      {props.label}
    </label>
  );
}
