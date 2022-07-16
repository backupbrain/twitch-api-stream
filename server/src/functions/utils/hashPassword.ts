import bcrypt from "bcrypt";
const saltRounds = 10;

export type Props = {
  password: string;
};
/**
 * Hash a password
 * @typedef {Object} Props
 * @property {string} password the password to hash
 * @returns string a hashed password
 */
export const hashPassword = ({ password }: Props): string => {
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  return hashedPassword;
};
