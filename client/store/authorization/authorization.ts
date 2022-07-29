import { NextRouter } from "next/router";
import create from "zustand";

export const authTokenStorageKey = "authToken";
export type AuthToken = {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt?: Date;
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
    if (!newAuthToken.expiresAt) {
      const expriesAtTimestamp = now + newAuthToken.expiresIn;
      newAuthToken.expiresAt = new Date(expriesAtTimestamp);
    }
    let isAuthenticated = false;
    if (newAuthToken.expiresAt && newAuthToken.expiresAt.getTime() > now) {
      isAuthenticated = true;
    }
    const expirationTime = newAuthToken.expiresAt;
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
    let newAuthToken: AuthToken = {
      accessToken: "",
      tokenType: "",
      refreshToken: "",
      expiresIn: 0,
      expiresAt: new Date(),
      scopes: [],
    };
    if (authTokenString) {
      newAuthToken = JSON.parse(authTokenString);
      if (typeof newAuthToken.expiresAt === "string") {
        newAuthToken.expiresAt = new Date(newAuthToken.expiresAt);
      }
    }
    const now = new Date().getTime();
    const expirationTime = newAuthToken.expiresAt || new Date();
    let isAuthenticated = false;
    if (newAuthToken.expiresAt && newAuthToken.expiresAt.getTime() > now) {
      isAuthenticated = true;
    }
    set({ authToken: newAuthToken, expirationTime, isAuthenticated });
  },
}));

export type AuthTokenRouterProps = {
  authToken?: AuthToken;
  router: NextRouter;
};
export const routeToLoginWhenAuthTokenExpired = ({
  authToken,
  router,
}: AuthTokenRouterProps) => {
  if (!authToken) {
  } else {
    const now = new Date();
    if (authToken.expiresAt && now >= authToken.expiresAt) {
      router.push({
        pathname: "/account/login",
      });
    }
  }
};
