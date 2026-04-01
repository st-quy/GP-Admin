import * as Yup from "yup";

export const CreateClassSchema = Yup.object().shape({
  className: Yup.string()
    .trim("Class name cannot be only whitespace")
    .required("Class name is required")
    .matches(
      /^[a-zA-Z0-9\s]+$/, 
      "Class name cannot contain special characters"
    )
    .min(3, "Class name must be at least 3 characters")
    .max(50, "Class name must be at most 50 characters")
    .test("not-only-spaces", "Class name cannot be only spaces", (value) => {
      return value && value.trim().length > 0;
    }),
});