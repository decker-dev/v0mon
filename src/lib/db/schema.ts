import {
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const pokemon = pgTable("pokemon", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  imageUrl: text("imageUrl").notNull(),
  type1: text("type1").notNull(),
  type2: text("type2"),
  pokemonName: text("pokemonName").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});