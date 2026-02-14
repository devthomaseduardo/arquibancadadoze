export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFound(message = "Recurso não encontrado") {
  return new AppError(message, 404, "NOT_FOUND");
}

export function badRequest(message = "Requisição inválida", code?: string) {
  return new AppError(message, 400, code ?? "BAD_REQUEST");
}

export function unauthorized(message = "Não autorizado") {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function serviceUnavailable(message = "Serviço temporariamente indisponível", code?: string) {
  return new AppError(message, 503, code ?? "SERVICE_UNAVAILABLE");
}
