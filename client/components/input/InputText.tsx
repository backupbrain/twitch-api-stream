import { useEffect, useState } from "react";

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
    <div>
      {props.label && (
        <label htmlFor={`${props.name}Input`}>{props.label}</label>
      )}
      <input
        id={`${props.name}Input`}
        name={props.name}
        type={props.type}
        placeholder={props.placeholder}
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        className="py-10 px-5"
      />
    </div>
  );
}
