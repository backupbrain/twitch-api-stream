import styles from "../../styles/Home.module.css";
import Link from "next/link";
import InputText from "../../components/InputText";
import { useRef } from "react";

export default function Login() {
  const username = useRef();
  const password = useRef();

  const onEmailChange = (text) => {
    username.current = text
    console.log({ username: username.current })
  }

  const onPasswordChange = (text) => {
    password.current = text
  }

  const login = async (event) => {
    event.preventDefault();
    const data = {
      username: username.current,
      password: password.current,
    }
    try {
      const response = await fetch("http://localhost:3030/api/1.0/account/login", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const responseJson = await response.json();
      console.log({ responseJson });
    } catch (error) {
      // TODO: process this error
      console.error(error);
    }
  }

  return (
  <div className={styles.container}>
    
    <h1 className="text-3xl font-bold underline">
      Login
    </h1>
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
      onChangeText={onEmailChange}
    />

    <InputText
      label="Password"
      name="password"
      type="password"
      value=""
      placeholder=""
      onChangeText={onPasswordChange}
    />

    <button
      onClick={(event) => {login(event)}}
    >
      Log in
    </button>
    </form>
  </div>
  );
}
