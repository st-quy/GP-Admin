import * as Yup from "yup";

export const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required("Current password is required")
    .min(6, "Current password must be at least 6 characters"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(6, "New password must be at least 6 characters"),
});



export const UpdateProfileSchema = Yup.object().shape({
  firstName: Yup.string()
    .transform((value) => (value && typeof value === 'string' && value.trim() ? value.trim() : undefined))
    .required("First name is required"),
  lastName: Yup.string()
    .transform((value) => (value && typeof value === 'string' && value.trim() ? value.trim() : undefined))
    .required("Last name is required"),
  teacherCode: Yup.string().trim(), 
  dob: Yup.string().nullable(),
  email: Yup.string() 
    .email("Enter a valid email"),
   
  phone: Yup.string()
    .transform((value) => (typeof value === "string" && value.trim() === "" ? null : value))
    .nullable()
    .test(
      "phone-format",
      "Phone number must be 9-10 digits",
      (value) => !value || /^\d{9,10}$/.test(value)
    ),
  address: Yup.string().transform((value) => (typeof value === "string" && value.trim() === "" ? null : value)).nullable(),
});