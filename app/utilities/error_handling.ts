export class ClientError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = statusCode;
  }
}

export class ServerError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = statusCode;
  }
}
export function errorResponse(error: any, response: any) {
  if (error instanceof ServerError) {
    return response.status(error.statusCode).json({
      message: error.message
    });
  }
  if (error instanceof ClientError) {
    return response.status(error.statusCode).json({
      message: error.message
    });
  }
}
