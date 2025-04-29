export class ResponseDto<T> {
  data: T;
  status: {
    statusCode: number;
    statusDescription: string;
  };

  constructor(data: T, statusCode: number = 200, statusDescription: string = 'OK') {
    this.data = data;
    this.status = {
      statusCode,
      statusDescription,
    };
  }
}
