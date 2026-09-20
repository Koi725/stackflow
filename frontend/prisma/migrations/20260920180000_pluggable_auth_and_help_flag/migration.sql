-- Pluggable auth + help flag.
-- passwordHash becomes nullable: users mirrored from an external auth provider
-- (AUTH_MODE=darsman) have no stackflow password. Local users still always have one.
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Card.needsHelp: a member can raise a hand for help on their own card.
ALTER TABLE "Card" ADD COLUMN "needsHelp" BOOLEAN NOT NULL DEFAULT false;
