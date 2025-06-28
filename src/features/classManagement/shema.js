import * as Yup from "yup";

export const CreateClassSchema = Yup.object().shape({
  className: Yup.string()
    .required("Class name is required")
    .matches(
      /^[a-zA-Z0-9\s]+$/, 
      "Class name cannot contain special characters"
    )
    .min(3, "Class name must be at least 3 characters")
    .max(50, "Class name must be at most 50 characters"),
});