import styles from "../../styles/Home.module.css";
import Link from "next/link";
import NavbarPublic from "../../components/navbar/NavbarPublic"
import FormRegister from "../../components/form/FormRegister"


export default function Register() {
  const navigateToAuthorizedPage = () => {

  }

  return (
  <div className={styles.container}>
    <NavbarPublic />

    <h1 className="text-3xl font-bold underline">
      Register
    </h1>
    <p className={styles.description}>
      <Link href="/">
        <a>Back to home</a>
      </Link>
    </p>
    <FormRegister
      onRegisterSuccess={navigateToAuthorizedPage}
    />
  </div>
  );
}
