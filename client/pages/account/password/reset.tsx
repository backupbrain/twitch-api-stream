import React, { useRef, useState } from "react";
import styles from "../../../styles/Home.module.css";
import Link from "next/link";
import NavbarPublic from "../../../components/navbar/NavbarPublic";
import InputText from "../../../components/input/InputText";

export default function Reset() {
  const username = useRef("");
  const [isFormValid, setIsFormValid] = useState(false);

  const onUsernameChange = async (text: string) => {
    username.current = text;
    await validateForm(text);
  };

  const validateForm = async (username: string) => {
    if (username) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  const requestPasswordReset = (event: unknown) => {
    // TODO: implement logic
    // navigate to confirmation page
  };

  return (
    <div className={styles.container}>
      <NavbarPublic />

      <h1 className="text-3xl font-bold underline">Reset Password</h1>
      <p className={styles.description}>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </p>

      <form>
        <InputText
          label="Email"
          name="email"
          type="email"
          value=""
          placeholder="email@example.com"
          onChangeText={onUsernameChange}
        />
        <button
          onClick={(event) => {
            requestPasswordReset(event);
          }}
          disabled={!isFormValid}
        >
          Request password reset
        </button>
      </form>
    </div>
  );
}
