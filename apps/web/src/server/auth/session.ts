import { z } from "zod";

import { ActorRefSchema, TimestampSchema } from "@openpolis/contracts";

import {
  readBetterAuthSession,
  resolveSessionActorFromSessionUser,
  resolveOperatorProfileFromSessionUser,
  signInBetterAuthOperator,
  signOutBetterAuthOperator
} from "./index";
import { hasOperatorUsers } from "./accounts";
import { isOperatorSessionConfigured } from "./config";
import {
  operatorProfileIds,
  getOperatorProfiles
} from "./profiles";
import { OperatorSessionError } from "./errors";

const OptionalUserNameSchema = z.string().trim().min(1).max(255).nullish().transform(
  (value) => value ?? undefined
);

const OperatorSessionPayloadSchema = z.object({
  profileId: z.enum(operatorProfileIds),
  actor: ActorRefSchema,
  issuedAt: TimestampSchema,
  expiresAt: TimestampSchema,
  userId: z.string().min(1).max(255),
  userEmail: z.string().email(),
  userName: OptionalUserNameSchema
});

export type OperatorSessionPayload = z.infer<typeof OperatorSessionPayloadSchema>;
export { isOperatorSessionConfigured, operatorProfileIds };

export async function readOperatorSession(): Promise<OperatorSessionPayload | null> {
  if (!isOperatorSessionConfigured()) {
    return null;
  }

  const session = await readBetterAuthSession();
  const profile = resolveOperatorProfileFromSessionUser(session?.user);

  if (!session || !profile) {
    return null;
  }

  const actor = resolveSessionActorFromSessionUser(session.user) ?? profile.actor;

  return OperatorSessionPayloadSchema.parse({
    actor,
    expiresAt: new Date(session.session.expiresAt).toISOString(),
    issuedAt: new Date(session.session.createdAt).toISOString(),
    profileId: profile.id,
    userEmail: session.user.email,
    userId: session.user.id,
    userName: session.user.name
  });
}

export async function createOperatorSession(email: string, password: string) {
  if (!isOperatorSessionConfigured()) {
    throw new OperatorSessionError("Operator session is not configured.");
  }

  await signInBetterAuthOperator(email, password);

  const session = await readOperatorSession();

  if (!session) {
    throw new OperatorSessionError("Failed to establish operator session.");
  }

  return session;
}

export async function clearOperatorSession() {
  if (!isOperatorSessionConfigured()) {
    return;
  }

  await signOutBetterAuthOperator();
}

export async function getOperatorSessionSummary() {
  if (!isOperatorSessionConfigured()) {
    return {
      configured: false,
      hasUsers: false,
      session: null,
      profiles: getOperatorProfiles()
    };
  }

  const [session, existingUsers] = await Promise.all([
    readOperatorSession(),
    hasOperatorUsers()
  ]);

  return {
    configured: true,
    hasUsers: existingUsers,
    session,
    profiles: getOperatorProfiles()
  };
}
