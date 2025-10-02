export function getErrorMessage(error){
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error).response === "object"
  ) {
    const data = (error).response?.data;
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error occurred";
}