import { describe, expect, it } from "bun:test";
import { requestId } from "../src/middleware/requestId";
import { cors } from "../src/middleware/cors";

function mockReqRes(headers: Record<string, string> = {}, method = "GET") {
  const req: any = { headers, method, originalUrl: "/" };
  const resHeaders: Record<string, string> = {};
  const res: any = {
    statusCode: 200,
    setHeader: (k: string, v: any) => { resHeaders[k] = String(v); },
    status: (code: number) => { res.statusCode = code; return res; },
    end: () => {}
  };
  return { req, res, headers: resHeaders };
}

describe("requestId & cors", () => {
  it("adds x-request-id when missing and preserves incoming one", () => {
    const c1 = mockReqRes({});
    requestId(c1.req, c1.res, () => {});
    expect(c1.headers["x-request-id"]).toBeTruthy();

    const c2 = mockReqRes({ "x-request-id": "abc" });
    requestId(c2.req, c2.res, () => {});
    expect(c2.headers["x-request-id"]).toBe("abc");
  });

  it("handles CORS preflight and reflects origin", () => {
    const c = mockReqRes({ origin: "http://example.com", "access-control-request-method": "POST" }, "OPTIONS");
    cors()(c.req, c.res, () => {});
    expect(c.res.statusCode).toBe(204);
    expect(c.headers["Access-Control-Allow-Origin"]).toBe("http://example.com");
  });
});


