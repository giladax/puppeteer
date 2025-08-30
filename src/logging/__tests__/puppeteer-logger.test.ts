const mockInfo = jest.fn();

jest.mock("pino", () => {
  return jest.fn(() => ({
    info: mockInfo,
  }));
});

import { initPuppeteerRun, puppeteerLog } from "../puppeteer-logger";

describe("PuppeteerLogger", () => {
  beforeEach(() => {
    mockInfo.mockClear();
  });

  it("should initialize run metadata", () => {
    const runMeta = { runId: "test-run", model: "gpt-4" };
    initPuppeteerRun(runMeta);
    
    puppeteerLog("test.event", { data: "test" });
    
    expect(mockInfo).toHaveBeenCalled();
    const logData = mockInfo.mock.calls[0][0];
    expect(logData.runId).toBe("test-run");
    expect(logData.model).toBe("gpt-4");
  });

  it("should capture event data", () => {
    puppeteerLog("test.event", { data: "test" });
    
    expect(mockInfo).toHaveBeenCalled();
    const logData = mockInfo.mock.calls[0][0];
    expect(logData.event).toBe("test.event");
    expect(logData.data).toBe("test");
    expect(logData.service).toBe("Puppeteer");
  });

  it("should include code snippet when requested", () => {
    puppeteerLog("test.event", { data: "test" }, { snippet: true });
    
    expect(mockInfo).toHaveBeenCalled();
    const logData = mockInfo.mock.calls[0][0];
    expect(logData.codeSnippet).toBeDefined();
  });

  it("should include stack trace when requested", () => {
    puppeteerLog("test.event", { data: "test" }, { stack: true });
    
    expect(mockInfo).toHaveBeenCalled();
    const logData = mockInfo.mock.calls[0][0];
    expect(logData.stack).toBeDefined();
  });
});