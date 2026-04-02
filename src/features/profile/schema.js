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
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  teacherCode: Yup.string().required("Code is required"),
  dob: Yup.string().nullable(),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^\d{9,10}$/, "Phone number must be 9-10 digits")
    .nullable(),
  address: Yup.string().nullable(),
});