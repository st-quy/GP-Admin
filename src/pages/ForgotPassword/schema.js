import * as Yup from "yup";


export const emailSchema = Yup.object().shape({
  email: Yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address Ex:abc@fpt.com")
    .max(255, "Email must be less than 255 characters")
    .transform((value) => value?.trim())
});