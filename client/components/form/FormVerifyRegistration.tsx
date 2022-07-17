import { MouseEvent, useEffect, useRef, useState } from "react";
import InputText from "../input/InputText";

export type Props = {
  username?: string;
  verificationCode?: string;
  onUsernameChange?: (text: string) => void;
  onVerificationChange?: (text: string) => void;
  onVerificationSuccess?: () => void;
  onVerificationFail?: (error: unknown) => void;
};
export default function FormVerifyRegistration(props: Props) {
  const username = useRef("");

  const verificationCode = useRef(props.verificationCode || "");
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    username.current = props.username || "";
  }, [props.username]);

  const onUsernameChange = async (text: string) => {
    username.current = text;
    await validateForm(text, verificationCode.current);
    if (props.onUsernameChange) {
      props.onUsernameChange(text);
    }
  };

  const onVerificationChange = async (text: string) => {
    verificationCode.current = text;
    await validateForm(username.current, verificationCode.current);
    if (props.onVerificationChange) {
      props.onVerificationChange(text);
    }
  };

  const validateForm = async (username: string, verificationCode: string) => {
    if (username && verificationCode) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  const verify = async (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    event.preventDefault();
    const data = {
      username: username.current,
      verificationCode: verificationCode.current,
    };
    try {
      const response = await fetch(
        "http://localhost:3030/api/1.0/account/verify",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const responseJson = await response.json();
      console.log({ responseJson });
      if (props.onVerificationSuccess) {
        props.onVerificationSuccess();
      }
    } catch (error) {
      // TODO: process this error
      console.error(error);
      if (props.onVerificationFail) {
        props.onVerificationFail(error);
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
          value={username.current}
          placeholder="email@example.com"
          onChangeText={onUsernameChange}
        />
        <InputText
          label="Verification Code"
          name="verification"
          type="text"
          value=""
          placeholder="123456"
          onChangeText={onVerificationChange}
        />
        <button
          onClick={(event) => {
            verify(event);
          }}
          disabled={!isFormValid}
        >
          Verify Account
        </button>
      </form>
    </div>
  );
}
