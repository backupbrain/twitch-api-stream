import styles from "../../styles/Home.module.css";
import Link from "next/link";
import NavbarPublic from "../../components/navbar/NavbarPublic";
import FormLogin from "../../components/form/FormLogin";

export default function Login() {
  const navigateToAuthorizedPage = () => {};

  return (
    <div className={styles.container}>
      <NavbarPublic />

      <h1 className="text-3xl font-bold underline">Login</h1>
      <p className={styles.description}>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </p>
      <FormLogin onLoginSuccess={navigateToAuthorizedPage} />
    </div>
  );
}
