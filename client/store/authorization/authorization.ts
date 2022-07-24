import { NextRouter } from "next/router";
import create from "zustand";

export const authTokenStorageKey = "authToken";
export type AuthToken = {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  expiresIn: number;
  scopes: string[];
};

export interface AuthState {
  authToken?: AuthToken;
  isAuthenticated: boolean;
  expirationTime: Date;
  setAuthToken: (authToken: AuthToken) => void;
  clearAuthToken: () => void;
  checkIfAuthTokenValid: () => void;
  loadAuthTokenFromStorage: () => void;
}

export const useStore = create<AuthState>((set, get) => ({
  authToken: undefined,
  isAuthenticated: true,
  expirationTime: new Date(),
  setAuthToken: (newAuthToken: AuthToken) => {
    // TODO: store expiration in asyncstorage
    const now = new Date().getTime();
    const expriesAtTimestamp = now + newAuthToken.expiresIn;
    const expirationTime = new Date(expriesAtTimestamp);
    const isAuthenticated = expirationTime.getTime() > now;
    console.log({ isAuthenticated });
    console.log({ expirationTime, now: new Date() });
    set({ authToken: newAuthToken, expirationTime, isAuthenticated });
    // get().checkIfAuthTokenValid();
    window.localStorage.setItem(
      authTokenStorageKey,
      JSON.stringify(newAuthToken)
    );
  },
  clearAuthToken: () => {
    set({
      authToken: undefined,
      isAuthenticated: false,
      expirationTime: new Date(),
    });
  },
  checkIfAuthTokenValid: () => {
    const now = new Date().getTime();
    const expirationTime = get().expirationTime;
    const isAuthenticated = expirationTime.getTime() > now;
    set({ expirationTime, isAuthenticated });
  },
  loadAuthTokenFromStorage: () => {
    const authTokenString = localStorage.getItem(authTokenStorageKey);
    console.log({ authTokenString });
    let newAuthToken: AuthToken = {
      accessToken: "",
      tokenType: "",
      refreshToken: "",
      expiresIn: 0,
      scopes: [],
    };
    if (authTokenString) {
      newAuthToken = JSON.parse(authTokenString);
      console.log({ newAuthToken });
    }
    const now = new Date().getTime();
    const expriesAtTimestamp = now + newAuthToken.expiresIn;
    const expirationTime = new Date(expriesAtTimestamp);
    const isAuthenticated = expirationTime.getTime() > now;
    console.log({ isAuthenticated });
    console.log({ expirationTime, now: new Date() });
    set({ authToken: newAuthToken, expirationTime, isAuthenticated });
  },
}));

export type AuthTokenRouterProps = {
  authToken?: AuthToken;
  expirationTime: Date;
  router: NextRouter;
};
export const routeToLoginWhenAuthTokenExpired = ({
  authToken,
  expirationTime,
  router,
}: AuthTokenRouterProps) => {
  if (!authToken) {
    console.log("Waiting for auth token...");
  } else {
    const now = new Date();
    if (now >= expirationTime) {
      console.log("expiration passed");
      console.log({ expirationTime, now });
      router.push({
        pathname: "/account/login",
      });
    } else {
      console.log("Login token still valid");
    }
  }
};
