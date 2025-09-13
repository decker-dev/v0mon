CREATE TABLE "pokemon" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"imageUrl" text NOT NULL,
	"type1" text NOT NULL,
	"type2" text,
	"pokemonName" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pokemon_username_unique" UNIQUE("username")
);
