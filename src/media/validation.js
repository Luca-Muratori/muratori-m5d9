import { checkSchema, validationResult } from "express-validator";
import createError from "http-errors";

const mediaSchema = {
  title: {
    in: ["body"],
    isString: {
      errorMessage:
        "Title validation failed! Title is mandatory and must be a string",
    },
  },
  year: {
    in: ["body"],
    isString: {
      errorMessage:
        "Category validation failed! Category is mandatory and must be a string",
    },
  },
  type: {
    in: ["body"],
    isEmail: {
      errorMessage: "email not in the right format!",
    },
  },
};

const reviewSchema = {
  text: {
    isString: {
      errorMessage: "Text field is required for comment",
    },
  },
  rate: {
    isNumeric: {
      errorMessage: "A valid rate (1-5) is required for comment",
    },
  },
};

export const checkReviewSchema = checkSchema(reviewSchema);

export const checkMediaSchema = checkSchema(mediaSchema);

export const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(
      createError(400, "Validation problems in req.body", {
        errorsList: errors.array(),
      })
    );
  } else {
    next();
  }
};
