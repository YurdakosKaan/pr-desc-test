import { describe, expect, it } from "bun:test";
import { rateLimit } from "../src/middleware/rateLimit";

function mockReqRes(ip: string = "127.0.0.1", statusCode: number = 200) {
  const req: any = {
    headers: {},
    socket: { remoteAddress: ip },
    originalUrl: "/"
  };
  const resHeaders: Record<string, string> = {};
  const res: any = {
    statusCode,
    setHeader: (k: string, v: any) => { resHeaders[k] = String(v); },
    status: (code: number) => { res.statusCode = code; return res; },
    json: (body: any) => { res.jsonBody = body; return res; },
    end: (chunk?: any, encoding?: any, cb?: any) => { if (cb) cb(); return res; }
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  return { req, res, headers: resHeaders, next, get nextCalled() { return nextCalled; } };
}

describe("rateLimit middleware", () => {
  it("allows requests within limit", () => {
    const limiter = rateLimit({ maxRequests: 5, windowMs: 60000 });
    const m = mockReqRes("192.168.100.0");
    limiter(m.req, m.res, m.next);
    expect(m.nextCalled).toBe(true);
    expect(m.headers["X-RateLimit-Remaining"]).toBe("4");
    expect(m.headers["X-RateLimit-Limit"]).toBe("5");
  });

  it("blocks requests exceeding limit", () => {
    const limiter = rateLimit({ maxRequests: 2, windowMs: 60000 });
    const testIP = "192.168.100.1";
    const m1 = mockReqRes(testIP);
    limiter(m1.req, m1.res, m1.next);
    expect(m1.nextCalled).toBe(true);

    const m2 = mockReqRes(testIP);
    limiter(m2.req, m2.res, m2.next);
    expect(m2.nextCalled).toBe(true);

    const m3 = mockReqRes(testIP);
    limiter(m3.req, m3.res, m3.next);
    expect(m3.nextCalled).toBe(false);
    expect(m3.res.statusCode).toBe(429);
    expect(m3.headers["X-RateLimit-Remaining"]).toBe("0");
    expect(m3.res.jsonBody?.error?.code).toBe("rate_limit_exceeded");
  });

  it("tracks different IPs separately", () => {
    const limiter = rateLimit({ maxRequests: 1, windowMs: 60000 });
    
    const m1 = mockReqRes("192.168.1.1");
    limiter(m1.req, m1.res, m1.next);
    expect(m1.nextCalled).toBe(true);

    const m2 = mockReqRes("192.168.1.1");
    limiter(m2.req, m2.res, m2.next);
    expect(m2.nextCalled).toBe(false); // blocked

    const m3 = mockReqRes("192.168.1.2");
    limiter(m3.req, m3.res, m3.next);
    expect(m3.nextCalled).toBe(true); // different IP, allowed
  });

  it("includes Retry-After header when blocked", () => {
    const limiter = rateLimit({ maxRequests: 1, windowMs: 5000 });
    const testIP = "192.168.100.2";
    const m1 = mockReqRes(testIP);
    limiter(m1.req, m1.res, m1.next);
    
    const m2 = mockReqRes(testIP);
    limiter(m2.req, m2.res, m2.next);
    expect(m2.headers["Retry-After"]).toBeTruthy();
    expect(Number(m2.headers["Retry-After"])).toBeGreaterThan(0);
  });
});

