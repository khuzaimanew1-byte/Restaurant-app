import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class ErrFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === "string"
          ? res
          : (res as Record<string, unknown>)["message"] ?? exception.message;
      response.status(status).json({ statusCode: status, message });
      return;
    }

    this.logger.error("Unhandled exception");

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Something went wrong. Please try again.",
    });
  }
}
