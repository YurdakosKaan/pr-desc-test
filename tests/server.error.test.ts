import { describe, expect, it } from "bun:test";
import { AppError, errorMiddleware } from "../src/middleware/error";

function createMockRes() {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => { res.statusCode = code; return res; };
  let jsonBody: any;
  res.json = (body: any) => { jsonBody = body; return res; };
  return { res, get body() { return jsonBody; } };
}

describe("error middleware", () => {
  it("formats AppError", () => {
    const mock = createMockRes();
    errorMiddleware(new AppError(404, "not found", "not_found"), {} as any, mock.res as any, () => {});
    expect(mock.res.statusCode).toBe(404);
    expect(mock.body.error.code).toBe("not_found");
  });

  it("handles unknown error", () => {
    const mock = createMockRes();
    errorMiddleware(new Error("boom"), {} as any, mock.res as any, () => {});
    expect(mock.res.statusCode).toBe(500);
    expect(mock.body.error.code).toBe("internal_error");
  });
});


