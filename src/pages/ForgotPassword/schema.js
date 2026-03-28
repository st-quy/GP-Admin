import * as Yup from "yup";


export const emailSchema = Yup.object().shape({
  email: Yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address Ex:abc@fpt.com")
    .max(255, "Email must be 255 characters or fewer")
    .transform((value) => value?.trim())
});