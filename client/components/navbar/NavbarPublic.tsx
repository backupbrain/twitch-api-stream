import Link from "next/link";
import React from "react";

export type Props = {
  user?: any; // TODO: make this a "user" object
};
export default function NavbarPublic(props: Props) {
  return (
    <div>
      <div>
        <Link href="/">
          <a>Company</a>
        </Link>
      </div>
      <div>
        <ul>
          {!props.user && (
            <li>
              <Link href="/account/login">
                <a>Login</a>
              </Link>
            </li>
          )}
          {!props.user && (
            <li>
              <Link href="/account/create">
                <a>Create account</a>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
