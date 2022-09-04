import { SuccessResponse } from "../types";

export type Props = {
  message?: string;
  data?: any;
};
export const successResponse = ({ message, data }: Props): SuccessResponse => {
  return {
    status: "success",
    message,
    data,
  };
};
