import styles from "../../styles/Home.module.css";
import Link from "next/link";
import NavbarPublic from "../../components/navbar/NavbarPublic";
import FormRegister from "../../components/form/FormRegister";
import { useRouter } from "next/router";
import React, { useRef } from "react";
const router = useRouter();

export default function Register() {
  const username = useRef("");

  const onUsernameChange = (text: string) => {
    username.current = text;
  };

  const navigateToVerifyPage = () => {
    router.push({
      pathname: "/account/verify",
      query: { username: username.current },
    });
  };

  return (
    <div className={styles.container}>
      <NavbarPublic />

      <h1 className="text-3xl font-bold underline">Create Account</h1>
      <p className={styles.description}>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </p>
      <FormRegister
        onUsernameChange={onUsernameChange}
        onRegisterSuccess={navigateToVerifyPage}
      />
    </div>
  );
}
