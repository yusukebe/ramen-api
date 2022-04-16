type Error = {
  message: string
}

type ErrorMessage = {
  errors: Error[]
}

export const createErrorMessage = (message: string): ErrorMessage => {
  return {
    errors: [
      {
        message: message,
      },
    ],
  }
}
