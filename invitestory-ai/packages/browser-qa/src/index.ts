// Browser QA using Playwright - captures screenshots, DOM, console errors, etc.

import {
  QAReport,
  JobId,
  AttemptNumber,
  SpecRevision,
  QAIssue,
  QASeverity,
  Component,
  ExactFact,
  createQAIssueId
} from "@invitestory/contracts";
import { chromium, Browser, Page, BrowserContext } from "playwright";

export type ISODateTime = string;

function createIssueId(prefix: string): ReturnType<typeof createQAIssueId> {
  return createQAIssueId(`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
}

export interface BrowserQAConfig {
  viewports: {
    mobile: { width: number; height: number };
    desktop: { width: number; height: number };
  };
  timeouts: {
    pageLoad: number;
    screenshot: number;
    script: number;
  };
  screenshotPaths: {
    mobile: string;
    desktop: string;
  };
}

export const DEFAULT_QA_CONFIG: BrowserQAConfig = {
  viewports: {
    mobile: { width: 390, height: 844 },
    desktop: { width: 1440, height: 900 }
  },
  timeouts: {
    pageLoad: 30000,
    screenshot: 10000,
    script: 15000
  },
  screenshotPaths: {
    mobile: "screenshots/mobile.png",
    desktop: "screenshots/desktop.png"
  }
};

export interface BrowserQAResult {
  qaReport: QAReport;
  screenshots: {
    mobile: Buffer;
    desktop: Buffer;
  };
  domSnapshots: {
    mobile: string;
    desktop: string;
  };
}

export class BrowserQAError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "BrowserQAError";
  }
}

export class BrowserQARunner {
  private browser: Browser | null = null;
  private config: BrowserQAConfig;

  constructor(config: BrowserQAConfig = DEFAULT_QA_CONFIG) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });
  }

  async runQA(
    jobId: JobId,
    attempt: AttemptNumber,
    specRevision: SpecRevision,
    previewUrl: string,
    spec: { components: Component[]; exactFacts: ExactFact[] }
  ): Promise<BrowserQAResult> {
    if (!this.browser) {
      throw new BrowserQAError("Browser not initialized", "BROWSER_NOT_INITIALIZED");
    }

    const context = await this.browser.newContext();
    const startTime = Date.now();

    try {
      // Mobile viewport test
      const mobileResult = await this.testViewport(context, previewUrl, "mobile", spec);
      
      // Desktop viewport test
      const desktopResult = await this.testViewport(context, previewUrl, "desktop", spec);

      // Factual checks
      const factResult = await this.runFactualChecks(context, previewUrl, spec);

      // Build overall QA report
      const qaReport = this.buildQAReport(
        jobId,
        attempt,
        specRevision,
        mobileResult,
        desktopResult,
        factResult,
        Date.now() - startTime
      );

      return {
        qaReport,
        screenshots: {
          mobile: mobileResult.screenshot,
          desktop: desktopResult.screenshot
        },
        domSnapshots: {
          mobile: mobileResult.dom,
          desktop: desktopResult.dom
        }
      };
    } finally {
      await context.close();
    }
  }

  private async testViewport(
    context: BrowserContext,
    url: string,
    viewport: "mobile" | "desktop",
    spec: { components: Component[]; exactFacts: ExactFact[] }
  ): Promise<{
    screenshot: Buffer;
    dom: string;
    consoleErrors: string[];
    pageErrors: string[];
    failedRequests: Array<{ url: string; status: number; error: string }>;
    issues: QAIssue[];
  }> {
    const vp = this.config.viewports[viewport];
    const page = await context.newPage();
    await page.setViewportSize(vp);

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedRequests: Array<{ url: string; status: number; error: string }> = [];
    const issues: QAIssue[] = [];

    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", error => {
      pageErrors.push(error.message);
    });

    page.on("requestfailed", request => {
      failedRequests.push({
        url: request.url(),
        status: 0,
        error: request.failure()?.errorText || "Unknown error"
      });
    });

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: this.config.timeouts.pageLoad });
      await page.waitForLoadState("domcontentloaded");

      // Wait for any hydration/client-side rendering
      await page.waitForTimeout(2000);

      // Capture screenshot
      const screenshot = await page.screenshot({
        fullPage: true,
        timeout: this.config.timeouts.screenshot
      });

      // Capture DOM
      const dom = await page.content();

      // Check for horizontal overflow
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth;
      });

      if (overflow) {
        issues.push({
          id: createIssueId(`overflow_${viewport}`),
          severity: "major",
          category: "browser",
          message: `Horizontal overflow detected on ${viewport}`,
          domSelector: "html",
          screenshotRegion: { x: 0, y: 0, width: vp.width, height: vp.height }
        });
      }

      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
        return images
          .filter(img => !img.complete || img.naturalWidth === 0)
          .map(img => img.src);
      });

      for (const src of brokenImages) {
        issues.push({
          id: createIssueId(`broken_img_${viewport}`),
          severity: "major",
          category: "browser",
          message: `Broken image: ${src}`,
          domSelector: `img[src="${src}"]`
        });
      }

      // Check links
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"));
        return anchors.map(a => ({ href: a.href, text: a.textContent?.slice(0, 100) }));
      });

      for (const link of links) {
        if (link.href.startsWith("http") && !link.href.includes("wa.me")) {
          try {
            const response = await page.request.head(link.href, { timeout: 5000 });
            if (response.status() >= 400) {
              issues.push({
                id: createIssueId(`broken_link_${viewport}`),
                severity: "major",
                category: "browser",
                message: `Broken link (${response.status()}): ${link.href}`,
                domSelector: `a[href="${link.href}"]`
              });
            }
          } catch {
            // Ignore network errors for external links
          }
        }
      }

      return { screenshot, dom, consoleErrors, pageErrors, failedRequests, issues };
    } catch (error) {
      issues.push({
        id: createIssueId(`page_load_${viewport}`),
        severity: "critical",
        category: "browser",
        message: `Failed to load page: ${error}`,
        domSelector: "html"
      });
      return {
        screenshot: Buffer.alloc(0),
        dom: "",
        consoleErrors: [String(error)],
        pageErrors: [],
        failedRequests: [],
        issues
      };
    } finally {
      await page.close();
    }
  }

  private async runFactualChecks(
    context: BrowserContext,
    url: string,
    spec: { components: Component[]; exactFacts: ExactFact[] }
  ): Promise<{
    issues: QAIssue[];
    checkedCount: number;
    passedCount: number;
  }> {
    const page = await context.newPage();
    await page.setViewportSize(this.config.viewports.desktop);
    const issues: QAIssue[] = [];
    let checkedCount = 0;
    let passedCount = 0;

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: this.config.timeouts.pageLoad });
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1000);

      // Check exact facts
      for (const fact of spec.exactFacts) {
        checkedCount++;
        const found = await this.checkFactInDOM(page, fact);
        if (found) {
          passedCount++;
        } else {
          issues.push({
            id: createIssueId(`fact_${fact.path}`),
            severity: fact.severity,
            category: "fact",
            message: `Fact mismatch: ${fact.path} expected "${fact.expected}"`,
            specPath: fact.path,
            expected: fact.expected
          });
        }
      }

      // Check component counts
      for (const component of spec.components) {
        checkedCount++;
        const count = await this.countComponentInDOM(page, component);
        if (count > 0) {
          passedCount++;
        } else {
          issues.push({
            id: createIssueId(`component_${component.id}`),
            severity: "critical",
            category: "fact",
            message: `Component ${component.id} (${component.type}:${component.variant}) not found in DOM`,
            specPath: `components.${component.id}`,
            domSelector: `[data-invitestory-component="${component.id}"]`
          });
        }
      }

      // Check RSVP links
      const rsvpComponents = spec.components.filter(c => c.type === "rsvp");
      for (const rsvp of rsvpComponents) {
        checkedCount++;
        const url = rsvp.data.url as string;
        if (url) {
          const found = await page.evaluate((u) => {
            const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"));
            return links.some(a => a.href === u);
          }, url);
          if (found) {
            passedCount++;
          } else {
            issues.push({
              id: createIssueId(`rsvp_link_${rsvp.id}`),
              severity: "critical",
              category: "fact",
              message: `RSVP link not found in DOM: ${url}`,
              specPath: `components.${rsvp.id}.data.url`,
              expected: url
            });
          }
        }
      }

    } finally {
      await page.close();
    }

    return { issues, checkedCount, passedCount };
  }

  private async checkFactInDOM(page: Page, fact: ExactFact): Promise<boolean> {
    const pathParts = fact.path.split(".");
    const expectedStr = String(fact.expected).toLowerCase();

    // Try to find by data attribute first
    const dataSelector = `[data-invitestory-fact="${fact.path}"]`;
    const dataElement = await page.$(dataSelector);
    if (dataElement) {
      const text = await dataElement.textContent();
      return text?.toLowerCase().includes(expectedStr) || false;
    }

    // Try component-specific selectors
    if (fact.path.includes("people.")) {
      const personId = pathParts[1];
      const selector = `[data-invitestory-person="${personId}"]`;
      const element = await page.$(selector);
      if (element) {
        const text = await element.textContent();
        return text?.toLowerCase().includes(expectedStr) || false;
      }
    }

    if (fact.path.includes("components.") && fact.path.includes("startsAt")) {
      const componentId = pathParts[1];
      const selector = `[data-invitestory-component="${componentId}"]`;
      const element = await page.$(selector);
      if (element) {
        const text = await element.textContent();
        return text?.toLowerCase().includes(expectedStr) || false;
      }
    }

    if (fact.path.includes("venues.")) {
      const venueId = pathParts[1];
      const selector = `[data-invitestory-venue="${venueId}"]`;
      const element = await page.$(selector);
      if (element) {
        const text = await element.textContent();
        return text?.toLowerCase().includes(expectedStr) || false;
      }
    }

    // Fallback: search entire page
    const bodyText = await page.textContent("body");
    return bodyText?.toLowerCase().includes(expectedStr) || false;
  }

  private async countComponentInDOM(page: Page, component: Component): Promise<number> {
    const selector = `[data-invitestory-component="${component.id}"]`;
    const elements = await page.$$(selector);
    return elements.length;
  }

  private buildQAReport(
    jobId: JobId,
    attempt: AttemptNumber,
    specRevision: SpecRevision,
    mobileResult: any,
    desktopResult: any,
    factResult: any,
    durationMs: number
  ): QAReport {
    const allIssues = [...mobileResult.issues, ...desktopResult.issues, ...factResult.issues];
    const criticalIssues = allIssues.filter(i => i.severity === "critical").length;
    const majorIssues = allIssues.filter(i => i.severity === "major").length;

    let overallStatus: QAReport["overallStatus"] = "pass";
    if (criticalIssues > 0) overallStatus = "fail";
    else if (majorIssues > 0) overallStatus = "review";

    return {
      jobId,
      attempt,
      specRevision,
      build: {
        status: "pass",
        logs: [],
        durationMs: 0
      },
      browser: {
        status: criticalIssues === 0 && majorIssues === 0 ? "pass" : "fail",
        consoleErrors: [...mobileResult.consoleErrors, ...desktopResult.consoleErrors],
        pageErrors: [...mobileResult.pageErrors, ...desktopResult.pageErrors],
        failedRequests: [...mobileResult.failedRequests, ...desktopResult.failedRequests],
        screenshots: {
          mobile: this.config.screenshotPaths.mobile,
          desktop: this.config.screenshotPaths.desktop
        },
        viewportSizes: this.config.viewports,
        durationMs
      },
      facts: {
        status: factResult.issues.length === 0 ? "pass" : "fail",
        issues: factResult.issues,
        checkedCount: factResult.checkedCount,
        passedCount: factResult.passedCount
      },
      visual: {
        status: "review",
        issues: []
      },
      overallStatus,
      blockingIssues: criticalIssues,
      createdAt: new Date().toISOString(),
      modelUsage: {
        transcription: 0,
        ocr: 0,
        extraction: 0,
        coding: 0,
        visualQA: 0
      }
    };
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export async function runBrowserQA(
  jobId: JobId,
  attempt: AttemptNumber,
  specRevision: SpecRevision,
  previewUrl: string,
  spec: { components: Component[]; exactFacts: ExactFact[] },
  config?: BrowserQAConfig
): Promise<BrowserQAResult> {
  const runner = new BrowserQARunner(config);
  await runner.initialize();
  try {
    return await runner.runQA(jobId, attempt, specRevision, previewUrl, spec);
  } finally {
    await runner.close();
  }
}