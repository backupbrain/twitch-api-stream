import Link from "next/link";
import { MouseEvent, useRef, useState } from "react";
import InputCheckbox from "../input/InputCheckbox";
import InputText from "../InputText";

export type Props = {
  username?: string;
  password?: string;
  didAgree?: boolean;
  onUsernameChange?: (text: string) => void;
  onPasswordChange?: (text: string) => void;
  onDidAgreeChange?: (isChecked: boolean) => void;
  onRegisterSuccess?: () => void;
  onRegisterFail?: (error: unknown) => void;
};
export default function FormRegister(props: Props) {
  const username = useRef(props.username || "");
  const password = useRef(props.password || "");
  const didAgree = useRef(props.didAgree || false);
  const [isFormValid, setIsFormValid] = useState(false);

  const onUsernameChange = async (text: string) => {
    username.current = text;
    await validateForm(text, password.current, didAgree.current);
    console.log({ username: username.current });
    if (props.onUsernameChange) {
      props.onUsernameChange(text);
    }
  };

  const onPasswordChange = async (text: string) => {
    password.current = text;
    await validateForm(username.current, text, didAgree.current);
    if (props.onPasswordChange) {
      props.onPasswordChange(text);
    }
  };

  const onAgreeCheckChanged = async (isChecked: boolean) => {
    didAgree.current = isChecked;
    await validateForm(username.current, password.current, isChecked);
    if (props.onDidAgreeChange) {
      props.onDidAgreeChange(isChecked);
    }
  };

  const validateForm = async (
    username: string,
    password: string,
    didAgree: boolean
  ) => {
    if (username && password && didAgree) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  const register = async (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    event.preventDefault();
    const data = {
      username: username.current,
      password: password.current,
    };
  };
  return (
    <div>
      <form>
        <div>
          <InputText
            label="Email"
            name="email"
            type="email"
            value=""
            placeholder="email@example.com"
            onChangeText={onUsernameChange}
          />

          <InputText
            label="Password"
            name="password"
            type="password"
            value=""
            placeholder=""
            onChangeText={onPasswordChange}
          />

          <InputCheckbox
            name="agreeTerms"
            label="I agree to the terms of service"
            onCheckChanged={onAgreeCheckChanged}
          />
        </div>
        <button
          onClick={(event) => {
            register(event);
          }}
          disabled={!isFormValid}
        >
          Create account
        </button>
      </form>
      <div>
        <Link href="/account/login">
          <a>Sign in</a>
        </Link>
      </div>
    </div>
  );
}
