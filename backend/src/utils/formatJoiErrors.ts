import Joi from "joi";

type ReturnErrorType = { [key: string]: string[] };

// const formatJoiErrors: (error: Joi.ValidationError) => ReturnErrorType | {} = (
//   error
// ) => {
//   return error.details.reduce((acc, curr) => {
//     const path = curr.path[0]; // Get the field name
//     if (!acc[path]) {
//       acc[path] = []; // Initialize the array if it doesn't exist
//     }
//     acc[path].push(curr.message.replace(/"/g, "")); // Add the error message
//     return acc;
//   }, {});
// };

// export default formatJoiErrors;

const formatJoiErrors: (error: Joi.ValidationError) => ReturnErrorType | {} = (
  error
) => {
  return error.details.reduce((acc, curr) => {
    const path = curr.path[0]; // Get the field name
    if (!acc[path]) {
      acc[path] = curr.message.replace(/"/g, ""); // Only store a single message string
    }
    return acc;
  }, {} as Record<string, string>);
};

export default formatJoiErrors;
