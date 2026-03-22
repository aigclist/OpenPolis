import "server-only";

import { z } from "zod";

import {
  ActorRoleSchema,
  EntityIdSchema,
  TimestampSchema,
  type ActorRef
} from "@openpolis/contracts";
import { GovernancePolicyError } from "@openpolis/governance";

import { getBetterAuthContext } from "./index";
import {
  createOperatorActorId,
  createOperatorUserClaims,
  OperatorProfileIdSchema,
  resolveOperatorClaimsFromSessionUser,
  type OperatorProfileId
} from "./profiles";
import {
  OperatorAccountConflictError,
  OperatorSessionError
} from "./errors";

const OptionalTimestampSchema = TimestampSchema.nullish().transform((value) =>
  value ?? undefined
);

const OptionalEntityIdSchema = EntityIdSchema.nullish().transform((value) =>
  value ?? undefined
);

const BetterAuthListUserSchema = z
  .object({
    id: z.string().min(1).max(255),
    email: z.string().email(),
    name: z.string().trim().min(1).max(255).nullish(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional()
  })
  .passthrough();

const OperatorAccountSchema = z.object({
  id: z.string().min(1).max(255),
  email: z.string().email(),
  name: z.string().trim().min(1).max(255).optional(),
  profileId: OperatorProfileIdSchema,
  actorId: EntityIdSchema,
  role: ActorRoleSchema,
  teamId: OptionalEntityIdSchema,
  regionId: OptionalEntityIdSchema,
  createdAt: OptionalTimestampSchema,
  updatedAt: OptionalTimestampSchema
});

const OperatorAccountInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(200),
  profileId: OperatorProfileIdSchema
});

export type OperatorAccount = z.infer<typeof OperatorAccountSchema>;
export type CreateOperatorAccountInput = z.infer<
  typeof OperatorAccountInputSchema
>;

type CreateOperatorAccountOptions = {
  requireEmptyStore?: boolean;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeName(value: string) {
  return value.trim();
}

function toOperatorAccount(user: unknown) {
  const parsedUser = BetterAuthListUserSchema.safeParse(user);

  if (!parsedUser.success) {
    return null;
  }

  const claims = resolveOperatorClaimsFromSessionUser(parsedUser.data);

  if (!claims) {
    return null;
  }

  return OperatorAccountSchema.parse({
    id: parsedUser.data.id,
    email: normalizeEmail(parsedUser.data.email),
    name: parsedUser.data.name ?? undefined,
    profileId: claims.operatorProfileId,
    actorId: claims.operatorActorId,
    role: claims.operatorRole,
    teamId: claims.operatorTeamId,
    regionId: claims.operatorRegionId,
    createdAt: parsedUser.data.createdAt?.toISOString(),
    updatedAt: parsedUser.data.updatedAt?.toISOString()
  });
}

async function assertOperatorEmailAvailable(email: string) {
  const context = await getBetterAuthContext();
  const existing = await context.internalAdapter.findUserByEmail(email, {
    includeAccounts: true
  });

  if (existing) {
    throw new OperatorAccountConflictError(
      `Operator account already exists for ${email}.`
    );
  }
}

export function canManageOperatorAccounts(
  actor: Pick<ActorRef, "role"> | null | undefined
) {
  return actor?.role === "central_ops" || actor?.role === "super_admin";
}

export function assertCanManageOperatorAccounts(
  actor: Pick<ActorRef, "role"> | null | undefined
) {
  if (!canManageOperatorAccounts(actor)) {
    throw new GovernancePolicyError(
      "The current operator is not allowed to manage operator accounts."
    );
  }
}

export async function listOperatorAccounts() {
  const context = await getBetterAuthContext();
  const users = await context.internalAdapter.listUsers(250, 0, undefined, undefined);

  return users
    .map((user) => toOperatorAccount(user))
    .filter((account): account is OperatorAccount => account !== null)
    .sort((left, right) => {
      const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0;
      const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0;
      return rightTime - leftTime;
    });
}

export async function hasOperatorUsers() {
  const accounts = await listOperatorAccounts();
  return accounts.length > 0;
}

async function createOperatorAccountInternal(
  input: CreateOperatorAccountInput,
  options: CreateOperatorAccountOptions = {}
) {
  const parsed = OperatorAccountInputSchema.parse({
    ...input,
    email: normalizeEmail(input.email),
    name: normalizeName(input.name)
  });

  await assertOperatorEmailAvailable(parsed.email);

  if (options.requireEmptyStore && (await hasOperatorUsers())) {
    throw new OperatorAccountConflictError(
      "Initial operator account has already been created."
    );
  }

  const context = await getBetterAuthContext();
  const operatorActorId = createOperatorActorId(parsed.email);
  const claims = createOperatorUserClaims(parsed.profileId, operatorActorId);

  if (!claims) {
    throw new OperatorSessionError(
      `Unknown operator profile: ${parsed.profileId}.`
    );
  }

  const user = await context.internalAdapter.createUser({
    email: parsed.email,
    name: parsed.name,
    emailVerified: true,
    ...claims
  });
  const hashedPassword = await context.password.hash(parsed.password);

  try {
    await context.internalAdapter.createAccount({
      accountId: user.id,
      password: hashedPassword,
      providerId: "credential",
      userId: user.id
    });
  } catch (accountError) {
    await context.internalAdapter.deleteUser(user.id).catch(() => {});
    throw accountError;
  }

  const createdAccount = toOperatorAccount({
    ...user,
    createdAt: user.createdAt ?? new Date(),
    updatedAt: user.updatedAt ?? new Date()
  });

  if (!createdAccount) {
    throw new OperatorSessionError("Failed to create a valid operator account.");
  }

  return createdAccount;
}

export async function createOperatorAccount(input: CreateOperatorAccountInput) {
  return createOperatorAccountInternal(input);
}

export async function createInitialOperatorAccount(input: {
  name: string;
  email: string;
  password: string;
}) {
  if (await hasOperatorUsers()) {
    throw new OperatorAccountConflictError(
      "Initial operator account has already been created."
    );
  }

  // Best-effort first-run protection. SQLite's single-writer model keeps the
  // race small, and this second check narrows the TOCTOU window further.
  return createOperatorAccountInternal({
    ...input,
    profileId: "central_ops"
  }, {
    requireEmptyStore: true
  });
}

export type { OperatorProfileId };
