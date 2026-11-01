import { createAuthClient } from "@neondatabase/auth";
import { BACKEND_BASE_URL } from "../api/backend";

export const neonAuthClient = createAuthClient(`${BACKEND_BASE_URL}/api/neon-auth`);
