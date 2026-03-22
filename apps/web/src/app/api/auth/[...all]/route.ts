import { toNextJsHandler } from "better-auth/next-js";

import { ensureBetterAuthReady, getAuth } from "@/server/auth";

export const runtime = "nodejs";

const handler = toNextJsHandler(async (request) => {
  await ensureBetterAuthReady();
  return getAuth().handler(request);
});

export const { DELETE, GET, PATCH, POST, PUT } = handler;
