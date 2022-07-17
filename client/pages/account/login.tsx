import styles from "../../styles/Home.module.css";
import Link from "next/link";
import NavbarPublic from "../../components/navbar/NavbarPublic";
import FormLogin from "../../components/form/FormLogin";
import { useRouter } from "next/router";

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
