import { ValidationError } from "class-validator";

export class HttpError extends Error {
  status?: number;
  details?: ValidationError[] = undefined;

  constructor(message?: string, status = 500) {
    super(message);
    this.status = status;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class HttpUnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(message, 401);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpUnauthorizedError.prototype);
  }
}

export class HttpForbiddenError extends HttpError {
  constructor(message?: string) {
    super(message, 403);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpForbiddenError.prototype);
  }
}

export class HttpInvalidInputError extends HttpError {
  constructor(details: any) {
    console.log({ details });
    let message = "Invalid input";
    if (typeof details === "string") {
      message = details;
    }
    super(message, 400);
    if (typeof details === "object") {
      console.log("setting details");
      this.details = details;
    }
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpInvalidInputError.prototype);
  }

  /**
   * Format the ValidationErrors into something REST-compatible
   *
   * @returns { property: string; errors: string[] } REST-compatible errors
   */
  getRestDetails() {
    const output: { property: string; errors: string[] }[] = [];
    console.log({ details: this.details });
    if (this.details) {
      this.details.forEach((validationError: ValidationError) => {
        const errorDescriptions: string[] = [];
        for (let key in validationError.constraints) {
          const errorDescription = validationError.constraints[key];
          errorDescriptions.push(errorDescription);
        }
        console.log(validationError);
        output.push({
          property: validationError.property,
          errors: errorDescriptions,
        });
      });
    }
    return output;
  }
}

export class HttpInternalServerError extends HttpError {
  constructor(message?: string) {
    super(message, 500);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpInternalServerError.prototype);
  }
}

// TODO: implement bandwidth throttling and payment errors
