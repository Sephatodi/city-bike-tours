import { db } from "@/db/client";
import { auditLogs } from "@/db/schema";

/**
 * Records an admin action. Never throws: a logging problem must not block the action itself.
 */
export async function logAudit(staff, action, summary, { targetType = null, targetId = null, detail = null } = {}) {
  try {
    await db.insert(auditLogs).values({
      actorId: staff?.id ?? null,
      actorName: staff?.name || staff?.email || "System",
      actorRole: staff?.role || "system",
      action,
      targetType,
      targetId: targetId == null ? null : String(targetId),
      summary,
      detail,
    });
  } catch (error) {
    console.error("Audit log write failed:", error.message);
  }
}
