import Link from "next/link";
import { MouseEvent, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import InputCheckbox from "../input/InputCheckbox";
import InputPassword from "../input/InputPassword";
import InputText from "../input/InputText";

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
    try {
      const response = await fetch(
        "http://localhost:3030/api/1.0/account/create",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.status == 200) {
        const responseJson = await response.json();
        console.log({ responseJson });
        if (props.onRegisterSuccess) {
          props.onRegisterSuccess();
        }
      } else {
        if (props.onRegisterFail) {
          const errorInfo = await response.json();
          console.log({ errorInfo });
          props.onRegisterFail(errorInfo.message);
        }
      }
    } catch (error) {
      // TODO: process this error
      console.error(error);
      if (props.onRegisterFail) {
        props.onRegisterFail(error);
      }
    }
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

          <InputPassword
            label="Password"
            name="password"
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
        <Button
          variant="primary"
          onClick={(event) => {
            register(event);
          }}
          disabled={!isFormValid}
        >
          Create account
        </Button>
      </form>
      <div>
        <Link href="/account/login">
          <a>Sign in</a>
        </Link>
      </div>
    </div>
  );
}
