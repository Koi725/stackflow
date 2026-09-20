import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import type { AuthProvider, ExternalIdentity } from "./types";

// Local provider (the public default): credentials are checked against
// stackflow's own User table with bcrypt, exactly as before pluggable auth.
// Users mirrored from an external provider have no passwordHash and therefore
// can never authenticate through this path.
export const localProvider: AuthProvider = {
  mode: "local",

  async verifyCredentials(email: string, password: string): Promise<ExternalIdentity | null> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Same negative result whether the email is unknown, the account has no
    // local password, or the password is wrong — never leak which.
    if (!user || !user.passwordHash) return null;
    if (!(await bcrypt.compare(password, user.passwordHash))) return null;

    return { email: user.email, name: user.name, role: user.role };
  },
};
