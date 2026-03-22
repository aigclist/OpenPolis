import type { CommandContext, Scope } from "@openpolis/contracts";
import { cookies, headers } from "next/headers";
import { logStructuredEvent } from "@openpolis/application/logging";

import {
  anonymousViewerActor,
  actorOverrideCookieName,
  actorOverrideHeaderName,
  createCommandRequestId,
  resolveCommandActor
} from "./actor-context";
import {
  isOperatorSessionConfigured,
  readOperatorSession
} from "../auth/session";
import { assertAuthenticatedCommandAccess } from "../auth/command-access";

export type ServerCommandContext = {
  command: CommandContext;
  defaultScope: Scope;
  ownerTeamId: string;
  regionId: string | undefined;
};

async function readActorOverrideValue() {
  const [headerStore, cookieStore] = await Promise.all([
    headers().catch(() => null),
    cookies().catch(() => null)
  ]);

  return (
    headerStore?.get(actorOverrideHeaderName) ??
    cookieStore?.get(actorOverrideCookieName)?.value ??
    null
  );
}

export async function resolveServerActorContext() {
  const session = await readOperatorSession();
  const sessionConfigured = isOperatorSessionConfigured();
  const overrideValue = session ? null : await readActorOverrideValue();
  const resolved = resolveCommandActor({
    overrideValue,
    sessionActor: session?.actor,
    fallbackActor: sessionConfigured ? anonymousViewerActor : undefined
  });

  if (overrideValue && !resolved.usedOverride) {
    logStructuredEvent("warn", "command-context.override-ignored", {
      overrideValue
    });
  }

  return {
    ...resolved,
    sessionConfigured,
    session
  };
}

export async function createServerCommandContext(
  actionName: string,
  reason: string
): Promise<ServerCommandContext> {
  const resolved = await resolveServerActorContext();
  assertAuthenticatedCommandAccess({
    sessionConfigured: resolved.sessionConfigured,
    session: resolved.session
  });

  return {
    command: {
      actor: resolved.actor,
      requestId: createCommandRequestId(actionName),
      reason
    },
    defaultScope: resolved.scope,
    ownerTeamId: resolved.ownerTeamId,
    regionId: resolved.regionId
  };
}
