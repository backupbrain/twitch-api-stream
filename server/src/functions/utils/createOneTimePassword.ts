export type Props = {
  length?: number;
};
/**
 * Generate an OAuth token
 * @typedef {Object} Props
 * @property {number?} length optional, must be greater than 0
 * @returns string an oauth token
 */
export const createOneTimePassword = ({ length = 6 }: Props): string => {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
