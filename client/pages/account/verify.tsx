import styles from "../../styles/Home.module.css";
import Link from "next/link";
import NavbarPublic from "../../components/navbar/NavbarPublic";
import FormVerifyRegistration from "../../components/form/FormVerifyRegistration";
import { useRouter } from "next/router";

export default function Verify() {
  const router = useRouter();
  const queryParameters = router.query;
  const getUsernameFromQueryParams = () => {
    let username = "";
    const usernames = queryParameters.username;
    if (usernames) {
      username = usernames as string;
    }
    return username;
  };
  const username = getUsernameFromQueryParams();

  const navigateToAuthorizedPage = () => {
    router.push({
      pathname: "/account",
    });
  };
  return (
    <div className={styles.container}>
      <NavbarPublic />

      <h1>Verify Your Account</h1>
      <p className={styles.description}>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </p>
      <FormVerifyRegistration
        username={username}
        onVerificationSuccess={navigateToAuthorizedPage}
      />
    </div>
  );
}
