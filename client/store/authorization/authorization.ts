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
    if (authTokenString) {
      const newAuthToken = JSON.parse(authTokenString);
      console.log({ newAuthToken });
      const now = new Date().getTime();
      const expriesAtTimestamp = now + newAuthToken.expiresIn;
      const expirationTime = new Date(expriesAtTimestamp);
      const isAuthenticated = expirationTime.getTime() > now;
      console.log({ isAuthenticated });
      console.log({ expirationTime, now: new Date() });
      set({ authToken: newAuthToken, expirationTime, isAuthenticated });
    }
  },
}));
