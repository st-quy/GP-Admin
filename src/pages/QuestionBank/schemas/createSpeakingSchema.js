// schema.js
import * as yup from "yup";

export const createSpeakingSchema = yup.object().shape({
    partName: yup.string().required("Title is required"),
    partType: yup.string().required("Please select a part type"),
    description: yup.string().required("Description is required"),

    questions: yup
        .array()
        .of(
            yup.object().shape({
                value: yup.string().required("Question cannot be empty"),
            })
        )
        .min(1, "At least 1 question is required"),
    image: yup
        .mixed()
        .required("Image is required")
        .test("fileType", "Only JPG/PNG images allowed", (file) =>
            file && ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
        ),
});
