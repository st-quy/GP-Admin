import * as yup from "yup";
import dayjs from "dayjs";

export const sessionSchema = yup.object().shape({
  sessionName: yup
    .string()
    .required("Session name is required")
    .max(100, "Session name cannot exceed 100 characters")
    .test("not-only-spaces", "Session name cannot be only spaces", (value) => {
      return value && value.trim().length > 0;
    }),
  sessionKey: yup
    .string()
    .required("Session key is required")
    .min(10, "Session key must be at least 10 characters")
    .max(20, "Session key cannot exceed 20 characters")
    .matches(/^[a-zA-Z0-9]+$/, "Session key can only contain letters and numbers"),
  examSet: yup.string().required("Please select an exam set"),
  dateRange: yup
    .array()
    .of(yup.mixed())
    .test("required", "Date range is required", (value) => {
      return value && value.length === 2 && value[0] && value[1];
    })
    .test("start-date-future", "Start time cannot be in the past", function (value) {
      const [startDate] = value || [];
      if (!startDate) return true;
      
      const now = dayjs().subtract(1, 'minute'); // 1 min grace period
      return dayjs(startDate).isAfter(now);
    })
    .test("end-after-start", "End time must be strictly after start time", function (value) {
      const [startDate, endDate] = value || [];
      if (startDate && endDate) {
        return dayjs(endDate).isAfter(dayjs(startDate));
      }
      return true;
    }),
});