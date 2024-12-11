// resultData.ts
export class ResultData<T> {
    code: number;
    message: string;
    data: T;
  
    constructor(code: number, message: string, data: T) {
      this.code = code;
      this.message = message;
      this.data = data;
    }
  
    static success<T>(data: T): ResultData<T> {
      return new ResultData(200, 'success', data);
    }
  
    static error<T>(message: string, code: number = 500): ResultData<T | null> {
      return new ResultData(code, message, null);
    }
  }