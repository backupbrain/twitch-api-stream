import "bootstrap/dist/css/bootstrap.min.css";
import { AppProps } from "next/app";
import { useEffect } from "react";
import {
  AuthState,
  useStore as useAuthStore,
} from "../store/authorization/authorization";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const loadAuthTokenFromStorage = useAuthStore(
    (state: AuthState) => state.loadAuthTokenFromStorage
  );

  useEffect(() => {
    loadAuthTokenFromStorage();
  }, []);
  return <Component {...pageProps} />;
}

export default MyApp;
