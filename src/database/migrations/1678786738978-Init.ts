import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1678786738978 implements MigrationInterface {
    name = 'Init1678786738978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_staff_type" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "perYearBonus" float NOT NULL, "perSubordinateBonus" float, "maxPercentFromBaseSalary" float NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_staff_type"("id", "name", "perYearBonus", "perSubordinateBonus", "maxPercentFromBaseSalary") SELECT "id", "name", "perYearBonus", "perSubordinateBonus", "maxPercentFromBaseSalary" FROM "staff_type"`);
        await queryRunner.query(`DROP TABLE "staff_type"`);
        await queryRunner.query(`ALTER TABLE "temporary_staff_type" RENAME TO "staff_type"`);
        await queryRunner.query(`CREATE TABLE "temporary_staff_type" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "perYearBonus" float NOT NULL, "perSubordinateBonus" float NOT NULL DEFAULT (0), "maxPercentFromBaseSalary" float NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_staff_type"("id", "name", "perYearBonus", "perSubordinateBonus", "maxPercentFromBaseSalary") SELECT "id", "name", "perYearBonus", "perSubordinateBonus", "maxPercentFromBaseSalary" FROM "staff_type"`);
        await queryRunner.query(`DROP TABLE "staff_type"`);
        await queryRunner.query(`ALTER TABLE "temporary_staff_type" RENAME TO "staff_type"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "staff_type" RENAME TO "temporary_staff_type"`);
        await queryRunner.query(`CREATE TABLE "staff_type" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "perYearBonus" float NOT NULL, "perSubordinateBonus" float, "maxPercentFromBaseSalary" float NOT NULL)`);
        await queryRunner.query(`INSERT INTO "staff_type"("id", "name", "perYearBonus", "perSubordinateBonus", "maxPercentFromBaseSalary") SELECT "id", "name", "perYearBonus", "perSubordinateBonus", "maxPercentFromBaseSalary" FROM "temporary_staff_type"`);
        await queryRunner.query(`DROP TABLE "temporary_staff_type"`);
        await queryRunner.query(`ALTER TABLE "staff_type" RENAME TO "temporary_staff_type"`);
        await queryRunner.query(`CREATE TABLE "staff_type" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "perYearBonus" float NOT NULL, "perSubordinateBonus" float, "maxPercentFromBaseSalary" float NOT NULL)`);
        await queryRunner.query(`INSERT INTO "staff_type"("id", "name", "perYearBonus", "perSubordinateBonus", "maxPercentFromBaseSalary") SELECT "id", "name", "perYearBonus", "perSubordinateBonus", "maxPercentFromBaseSalary" FROM "temporary_staff_type"`);
        await queryRunner.query(`DROP TABLE "temporary_staff_type"`);
    }

}
