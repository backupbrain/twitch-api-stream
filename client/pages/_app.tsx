import "../styles/globals.css";
import {
  AuthState,
  useStore as useAuthStore,
} from "../store/authorization/authorization";
import { useEffect } from "react";
import { AppProps } from "next/app";

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
