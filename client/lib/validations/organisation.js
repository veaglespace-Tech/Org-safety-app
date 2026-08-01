import { z } from "zod";
import {
  ORGANIZATION_NAME_REGEX,
  PHONE_DIGIT_MAX,
  PHONE_DIGIT_MIN,
  PLACE_NAME_REGEX,
  isNotCommonEmailTypo,
  toDigitsOnly,
} from "@/utils/formValidation";

export const organisationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name is required")
    .max(100, "Organization name is too long")
    .regex(
      ORGANIZATION_NAME_REGEX,
      "Organization name can only include letters, numbers, spaces, and . & ( ) - characters"
    ),
  email: z
    .string()
    .trim()
    .min(1, "Business email is required")
    .email("Invalid business email address")
    .refine(isNotCommonEmailTypo, {
      message: "Did you mean .com or .co.in? Please enter a valid email address.",
    }),
  phoneCountryCode: z.string().regex(/^\+\d{1,3}$/, "Select a valid country code"),
  phone: z
    .string()
    .trim()
    .min(1, "Business phone number is required")
    .refine(
      (value) => toDigitsOnly(value).length >= PHONE_DIGIT_MIN,
      "Business phone number is too short"
    )
    .refine(
      (value) => toDigitsOnly(value).length <= PHONE_DIGIT_MAX,
      "Business phone number is too long"
    ),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(80, "City is too long")
    .regex(PLACE_NAME_REGEX, "Enter a valid city"),
  state: z
    .string()
    .trim()
    .min(1, "State is required")
    .max(80, "State is too long")
    .regex(PLACE_NAME_REGEX, "Enter a valid state"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(80, "Country is too long")
    .regex(PLACE_NAME_REGEX, "Enter a valid country"),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(180, "Address is too long"),
});

export const organisationDefaultValues = {
  name: "",
  email: "",
  phoneCountryCode: "+91",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
};
