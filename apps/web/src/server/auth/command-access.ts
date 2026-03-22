import type { OperatorSessionPayload } from "./session";
import { OperatorSessionError } from "./errors";

export function assertAuthenticatedCommandAccess(options: {
  sessionConfigured: boolean;
  session: OperatorSessionPayload | null;
}) {
  if (options.sessionConfigured && !options.session) {
    throw new OperatorSessionError(
      "Authenticated operator session required for workflow commands."
    );
  }
}
