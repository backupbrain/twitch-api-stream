import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import Container from "react-bootstrap/Container";
import FormRegister from "../../components/form/FormRegister";
import NavbarPublic from "../../components/navbar/NavbarPublic";
import styles from "../../styles/Home.module.css";

export default function Register() {
  const username = useRef("");
  const router = useRouter();

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
      <Container>
        <h1>Create Account</h1>
        <p className={styles.description}>
          <Link href="/">
            <a>Back to home</a>
          </Link>
        </p>
        <FormRegister
          onUsernameChange={onUsernameChange}
          onRegisterSuccess={navigateToVerifyPage}
        />
      </Container>
    </div>
  );
}
