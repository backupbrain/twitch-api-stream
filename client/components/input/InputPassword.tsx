import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

export type Props = {
  label?: string;
  name: string;
  value: string;
  placeholder: string;
  onChangeText?: (value: string) => void;
};
export default function InputPassword(props: Props) {
  const [localValue, _setLocalValue] = useState("");
  const [isObscured, setIsObscured] = useState(true);

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
      <InputGroup>
        <Form.Control
          id={`${props.name}Input`}
          name={props.name}
          type={isObscured ? "password" : "text"}
          placeholder={props.placeholder}
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
        />
        {isObscured ? (
          <Button
            onClick={() => setIsObscured(false)}
            variant="outline-secondary"
          >
            Show
          </Button>
        ) : (
          <Button
            onClick={() => setIsObscured(true)}
            variant="outline-secondary"
          >
            Hide
          </Button>
        )}
      </InputGroup>
    </Form.Group>
  );
}
