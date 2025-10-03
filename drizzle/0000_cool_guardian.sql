CREATE TABLE "technologies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "technologies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" varchar(2048) NOT NULL,
	"x" double precision NOT NULL,
	"y" double precision NOT NULL,
	"angle" double precision GENERATED ALWAYS AS (((ROUND(DEGREES(ATAN2(0.5 - "technologies"."y", "technologies"."x" - 0.5)))::int % 360 + 360) % 360)) STORED NOT NULL,
	"radius" double precision GENERATED ALWAYS AS (SQRT(POW("technologies"."x" - 0.5, 2) + POW(0.5 - "technologies"."y", 2))) STORED NOT NULL,
	"org" char(31) NOT NULL,
	CONSTRAINT "angle_check" CHECK ("technologies"."angle" >= 0 AND "technologies"."angle" < 360),
	CONSTRAINT "radius_check" CHECK ("technologies"."radius" > 0 AND "technologies"."radius" <= 1)
);
