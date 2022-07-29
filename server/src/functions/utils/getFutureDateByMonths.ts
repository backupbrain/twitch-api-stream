export type Props = {
  date: Date;
  numMonths: number;
};
export const getFutureDateByMonths = ({ date, numMonths }: Props) => {
  const d = date.getDate();
  date.setMonth(date.getMonth() + +numMonths);
  if (date.getDate() != d) {
    date.setDate(0);
  }
  return date;
};
