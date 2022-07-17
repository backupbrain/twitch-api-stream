import styles from "../../styles/Home.module.css";
import Link from "next/link";
import {
  AuthState,
  useStore as useAuthStore,
} from "../../store/authorization/authorization";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Index() {
  const router = useRouter();
  const expirationTime = useAuthStore(
    (state: AuthState) => state.expirationTime
  );

  const routeToLoginWhenAuthTokenExpired = () => {
    const now = new Date();
    if (now >= expirationTime) {
      console.log("expiration passed");
      console.log({ expirationTime, now });
      router.push({
        pathname: "/account/login",
      });
    }
  };
  useEffect(() => {
    routeToLoginWhenAuthTokenExpired();
  }, [expirationTime]);
  return (
    <div className={styles.container}>
      <h1 className="text-3xl font-bold underline">Authorized page</h1>
      <p className={styles.description}>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </p>
    </div>
  );
}
