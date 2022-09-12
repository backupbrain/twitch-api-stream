import { useState } from "react";
import Form from "react-bootstrap/Form";

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
    <Form.Check
      checked={isChecked}
      type={"checkbox"}
      id={`${props.name}Checkbox`}
      label={props.label}
      onChange={onChange}
    />
  );
}
