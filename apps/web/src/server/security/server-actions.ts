import "server-only";

import { headers } from "next/headers";

import { logStructuredEvent } from "@openpolis/application/logging";

import { assertTrustedActionRequest } from "./trusted-action-origin";

export async function assertTrustedServerActionRequest() {
  const headersStore = await headers();

  try {
    assertTrustedActionRequest(headersStore);
  } catch (error) {
    logStructuredEvent("warn", "server-action.csrf-rejected", {
      origin: headersStore.get("origin") ?? headersStore.get("referer"),
      host: headersStore.get("host"),
      forwardedHost: headersStore.get("x-forwarded-host"),
      secFetchSite: headersStore.get("sec-fetch-site"),
      error
    });
    throw error;
  }
}
