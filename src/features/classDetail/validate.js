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
  sessionName: yup
    .string()
    .trim()
    .required("Session name is required")
    .test("not-blank", "Session name cannot be only whitespace", (value) => value && value.trim().length > 0)
    .max(100, "Session name must be at most 100 characters"),
  sessionKey: yup
    .string()
    .trim()
    .required("Session key is required")
    .min(10, "Session key must be at least 10 characters"),
  examSet: yup.string().required("Please select an exam set"),
  dateRange: yup
    .array()
    .of(yup.date().nullable())
    .required("Please select a date range")
    .min(2, "Please select both start and end date")
    .test("start-date", "Start date must be today or later", function (value) {
      return isStartDateValid(value?.[0]);
    })
    .test(
      "end-date",
      "End date must be after start date",
      function (value) {
        const [startDate, endDate] = value || [];
        if (startDate && endDate) {
          return dayjs(endDate).isAfter(dayjs(startDate));
        }
        return true;
      }
    ),
});