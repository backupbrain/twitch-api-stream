import canonicalize from "canonicalize";

export type SuccessResponseType = string | undefined;
export type Props = {
  message?: string;
  data?: any;
};
export const successResponse = ({
  message,
  data,
}: Props): SuccessResponseType => {
  return canonicalize({
    status: "success",
    message,
    data,
  });
};
