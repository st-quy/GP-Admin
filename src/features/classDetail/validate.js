import * as yup from "yup";
import dayjs from "dayjs";

function isStartDateValid(startDate) {
  if (!startDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  return start.getTime() >= today.getTime();
}

export const sessionSchema = yup.object().shape({
  sessionName: yup.string().required("Session name is required"),
  sessionKey: yup
    .string()
    .required("Session key is required")
    .min(10, "Session key must be at least 10 characters"),
  examSet: yup.string().required("Please select a exam set"),
  dateRange: yup
    .array()
    .of(yup.date().nullable())
    .min(2, "Date range must have start and end date")
    .test("start-date", "Start date must be today or later", function (value) {
      return isStartDateValid(value?.[0]);
    }),
});
