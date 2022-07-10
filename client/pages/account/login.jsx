import styles from "../../styles/Home.module.css";
import Link from "next/link";

export default function Login() {
  return (
  <div className={styles.container}>
    <h1>Login</h1>
    <p className={styles.description}>
      <Link href="/">
        <a>Back to home</a>
      </Link>
    </p>
  </div>
  );
}
