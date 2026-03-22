type SecurityHeadersOptions = {
  isDevelopment?: boolean;
};

function createDirective(name: string, values: string[]) {
  return `${name} ${values.join(" ")}`;
}

export function createContentSecurityPolicy(
  options: SecurityHeadersOptions = {}
) {
  const isDevelopment = options.isDevelopment ?? process.env.NODE_ENV !== "production";
  const scriptSources = ["'self'", "'unsafe-inline'"];
  const connectSources = ["'self'", "https:"];

  if (isDevelopment) {
    scriptSources.push("'unsafe-eval'");
    connectSources.push("http:", "ws:", "wss:");
  }

  return [
    createDirective("default-src", ["'self'"]),
    createDirective("script-src", scriptSources),
    createDirective("style-src", ["'self'", "'unsafe-inline'"]),
    createDirective("img-src", ["'self'", "data:", "blob:", "https:"]),
    createDirective("font-src", ["'self'", "data:", "https:"]),
    createDirective("connect-src", connectSources),
    createDirective("media-src", ["'self'", "data:", "blob:", "https:"]),
    createDirective("object-src", ["'none'"]),
    createDirective("base-uri", ["'self'"]),
    createDirective("form-action", ["'self'"]),
    createDirective("frame-ancestors", ["'none'"])
  ].join("; ");
}

export function getSecurityHeaders(options: SecurityHeadersOptions = {}) {
  return [
    ["Content-Security-Policy", createContentSecurityPolicy(options)],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
    ["X-Content-Type-Options", "nosniff"],
    ["X-Frame-Options", "DENY"],
    ["Cross-Origin-Opener-Policy", "same-origin"],
    ["Cross-Origin-Resource-Policy", "same-site"],
    [
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), browsing-topics=()"
    ]
  ] as const;
}

export function applySecurityHeaders(
  headers: Headers,
  options: SecurityHeadersOptions = {}
) {
  for (const [name, value] of getSecurityHeaders(options)) {
    headers.set(name, value);
  }

  return headers;
}
