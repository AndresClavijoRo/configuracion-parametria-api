export class ErrorResponseDto {
  data: {
    requestError: string;
  };
  status: {
    statusCode: number;
    statusDescription: string;
  };

  constructor(
    message: string,
    statusCode: number = 400,
    statusDescription: string = 'Valores nulos o incorrectos en los parámetros de entrada.',
  ) {
    this.data = {
      requestError: message,
    };
    this.status = {
      statusCode,
      statusDescription,
    };
  }
}
