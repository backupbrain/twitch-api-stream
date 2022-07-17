import { useEffect, useState } from "react";

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
    <div>
      {props.label && (
        <label htmlFor={`${props.name}Input`}>{props.label}</label>
      )}
      <input
        id={`${props.name}Input`}
        name={props.name}
        type={isObscured ? "password" : "text"}
        placeholder={props.placeholder}
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        className="py-10 px-5"
      />
      {isObscured ? (
        <a onClick={() => setIsObscured(false)}>Show</a>
      ) : (
        <a onClick={() => setIsObscured(true)}>Hide</a>
      )}
    </div>
  );
}
