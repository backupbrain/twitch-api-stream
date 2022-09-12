import Link from "next/link";
import { useRouter } from "next/router";
import Container from "react-bootstrap/Container";
import FormLogin from "../../components/form/FormLogin";
import NavbarPublic from "../../components/navbar/NavbarPublic";
import styles from "../../styles/Home.module.css";

export default function Login() {
  const router = useRouter();
  const navigateToAuthorizedPage = () => {
    router.push({
      pathname: "/account",
    });
  };

  return (
    <div className={styles.container}>
      <NavbarPublic />
      <Container>
        <h1 className="text-3xl font-bold underline">Login</h1>
        <p className={styles.description}>
          <Link href="/">
            <a>Back to home</a>
          </Link>
        </p>
        <FormLogin onLoginSuccess={navigateToAuthorizedPage} />
      </Container>
    </div>
  );
}
