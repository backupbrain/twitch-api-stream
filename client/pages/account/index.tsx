import styles from "../../styles/Home.module.css";
import Link from "next/link";
import {
  AuthState,
  useStore as useAuthStore,
  routeToLoginWhenAuthTokenExpired,
} from "../../store/authorization/authorization";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export type ApiStats = {
  userId: string;
  accountBirthday: Date;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  numApiCallsSinceAccountBirthday: number;
  numApiCallsSinceBillingStart: number;
  numApiCallsRemainingInBillingPeriod: number;
  numApiCallsAllowedInPeriod: number;
  lastApiCall: Date | null;
};

export default function Index() {
  const router = useRouter();
  const expirationTime = useAuthStore(
    (state: AuthState) => state.expirationTime
  );
  const authToken = useAuthStore((state: AuthState) => state.authToken);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);
  const [apiStatsError, setApiStatsError] = useState("");

  const getApiStats = async () => {
    setApiStatsError("");
    if (!authToken) {
      setApiStatsError("Couldn't reach API server");
      return;
    }
    try {
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `${authToken.tokenType} ${authToken?.accessToken}`,
      };
      const response = await fetch(
        "http://localhost:3030/api/1.0/account/stats",
        {
          method: "GET",
          headers,
        }
      );
      if (response.status == 200) {
        const rawApiStats: any = await response.json();
        const {
          accountBirthday,
          billingPeriodStart,
          billingPeriodEnd,
          ...apiStatParts
        } = rawApiStats;
        const apiStats: ApiStats = {
          ...apiStatParts,
          accountBirthday: new Date(accountBirthday),
          billingPeriodStart: new Date(billingPeriodStart),
          billingPeriodEnd: new Date(billingPeriodEnd),
        };
        setApiStats(apiStats);
      } else {
        const errorInfo = await response.json();
        setApiStatsError(errorInfo.message);
      }
    } catch (error) {
      setApiStatsError("Couldn't reach API server");
    }
  };

  useEffect(() => {
    routeToLoginWhenAuthTokenExpired({ authToken, router });
  }, [expirationTime]);

  useEffect(() => {
    if (authToken) {
      getApiStats();
    }
  }, [authToken]);

  return (
    <div className={styles.container}>
      <h1 className="text-3xl font-bold underline">Authorized page</h1>
      <p className={styles.description}>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </p>
      {apiStatsError !== "" && (
        <div className={styles.alertError}>{apiStatsError}</div>
      )}
      {apiStats && (
        <div>
          <div>
            <div>Account Open Date:</div>
            <div>{apiStats.accountBirthday.toLocaleDateString("en-US")}</div>
          </div>
          <div>
            <div>Billing Period Start Date:</div>
            <div>{apiStats.billingPeriodStart.toLocaleDateString("en-US")}</div>
          </div>
          <div>
            <div>Billing Period Renewal Date:</div>
            <div>{apiStats.billingPeriodEnd.toLocaleDateString("en-US")}</div>
          </div>
          <div>
            <div>Num API Calls Allowed in Billing Period:</div>
            <div>{apiStats.numApiCallsAllowedInPeriod}</div>
          </div>
          <div>
            <div>Num API Calls Since Billing Period Start:</div>
            <div>{apiStats.numApiCallsSinceBillingStart}</div>
          </div>
          <div>
            <div>Num API Calls Remaining in Period Start:</div>
            <div>{apiStats.numApiCallsRemainingInBillingPeriod}</div>
          </div>
          <div>
            <div>Total API Calls Since Account Open:</div>
            <div>{apiStats.numApiCallsSinceAccountBirthday}</div>
          </div>
        </div>
      )}
    </div>
  );
}
