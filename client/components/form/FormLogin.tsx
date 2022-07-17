import Link from "next/link";
import { MouseEvent, useRef, useState } from "react";
import InputText from "../input/InputText";
import {
  AuthState,
  AuthToken,
  useStore as useAuthStore,
} from "../../store/authorization/authorization";
import InputPassword from "../input/InputPassword";

export type Props = {
  username?: string;
  password?: string;
  onUsernameChange?: (text: string) => void;
  onPasswordChange?: (text: string) => void;
  onLoginSuccess?: () => void;
  onLoginFail?: (error: unknown) => void;
};
export default function FormLogin(props: Props) {
  const username = useRef(props.username || "");
  const password = useRef(props.password || "");
  const [isFormValid, setIsFormValid] = useState(false);
  const setAuthToken = useAuthStore((state: AuthState) => state.setAuthToken);

  const onUsernameChange = async (text: string) => {
    username.current = text;
    await validateForm(text, password.current);
    console.log({ username: username.current });
    if (props.onUsernameChange) {
      props.onUsernameChange(text);
    }
  };

  const onPasswordChange = async (text: string) => {
    password.current = text;
    await validateForm(username.current, text);
    if (props.onPasswordChange) {
      props.onPasswordChange(text);
    }
  };

  const validateForm = async (username: string, password: string) => {
    if (username && password) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  const login = async (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    event.preventDefault();
    const data = {
      username: username.current,
      password: password.current,
    };
    try {
      const response = await fetch(
        "http://localhost:3030/api/1.0/account/login",
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
        const authToken: AuthToken = await response.json();
        setAuthToken(authToken);
        console.log({ authToken });
        if (props.onLoginSuccess) {
          props.onLoginSuccess();
        }
      } else {
        const errorInfo = await response.json();
        if (props.onLoginFail) {
          props.onLoginFail(errorInfo.message);
        }
      }
    } catch (error) {
      // TODO: process this error
      console.error(error);
      if (props.onLoginFail) {
        props.onLoginFail(error);
      }
    }
  };
  return (
    <div>
      <form>
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

        <button
          onClick={(event) => {
            login(event);
          }}
          disabled={!isFormValid}
        >
          Log in
        </button>
      </form>
      <div>
        <Link href="/account/register">
          <a>Create account</a>
        </Link>
      </div>
      <div>
        <Link href="/account/password/reset">
          <a>Reset password</a>
        </Link>
      </div>
    </div>
  );
}
