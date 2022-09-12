import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";

export type Props = {
  label?: string;
  name: string;
  type: string;
  value: string;
  placeholder: string;
  onChangeText?: (value: string) => void;
};
export default function InputText(props: Props) {
  const [localValue, _setLocalValue] = useState("");

  const setLocalValue = (value: string) => {
    _setLocalValue(value);
    if (props.onChangeText) {
      props.onChangeText(value);
    }
  };

  useEffect(() => {
    setLocalValue(props.value);
  }, [props.value]);

  // make props.type = "text" by default
  return (
    <Form.Group className="mb-3">
      {props.label && (
        <Form.Label htmlFor={`${props.name}Input`}>{props.label}</Form.Label>
      )}
      <Form.Control
        id={`${props.name}Input`}
        name={props.name}
        type={props.type}
        placeholder={props.placeholder}
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
      />
    </Form.Group>
  );
}
