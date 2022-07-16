import bcrypt from "bcrypt";

export type Props = {
  password: string;
  hashedPassword: string;
};
/**
 * Verify if a password matches a hashed password
 * @typedef {Object} Props
 * @property {string} password the password to verify
 * @property {string} hashedPassword the hashed password
 * @returns true if passwords match, false otherwise
 */
export const verifyPassword = ({
  password,
  hashedPassword,
}: Props): boolean => {
  const didMatch = bcrypt.compareSync(password, hashedPassword);
  return didMatch;
};
