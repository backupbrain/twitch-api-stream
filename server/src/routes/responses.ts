export type SuccessResponseType = {
  status: string;
  message?: string;
  data?: any;
};
export type Props = {
  message?: string;
  data?: any;
};
export const successResponse = ({
  message,
  data,
}: Props): SuccessResponseType => {
  return {
    status: "success",
    message,
    data,
  };
};
