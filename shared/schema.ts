import { sql } from "drizzle-orm";
import { pgTable, serial, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Programs 테이블 - 프로그램 정보
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "진로체험활동", "동아리활동"
  quota: integer("quota").notNull(), // 정원
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Applications 테이블 - 학생 신청 정보
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id", { length: 50 }).notNull().unique(), // 학번 (UNIQUE)
  name: text("name").notNull(), // 학생 이름
  phone: text("phone"), // 전화번호 (재제출 시 필수)
  birthdate: text("birthdate"), // 생년월일 (재제출 시 필수)
  choice1: integer("choice_1").notNull(), // 1지망 프로그램 ID
  choice2: integer("choice_2").notNull(), // 2지망 프로그램 ID
  choice3: integer("choice_3").notNull(), // 3지망 프로그램 ID
  submissionCount: integer("submission_count").notNull().default(1), // 제출 횟수
  firstSubmittedAt: timestamp("first_submitted_at").notNull().defaultNow(), // 최초 제출 시각
  lastSubmittedAt: timestamp("last_submitted_at").notNull().defaultNow(), // 마지막 제출 시각
});

// Allocations 테이블 - 배치 결과
export const allocations = pgTable("allocations", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id", { length: 50 }).notNull(), // 학번
  programId: integer("program_id").notNull(), // 배치된 프로그램 ID
  choiceRank: integer("choice_rank").notNull(), // 지망 순위 (1, 2, 3)
  allocationType: text("allocation_type").notNull(), // "자동배치", "수동배치"
  allocatedAt: timestamp("allocated_at").notNull().defaultNow(), // 배치 시각
});

// Insert schemas
export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  submissionCount: true,
  firstSubmittedAt: true,
  lastSubmittedAt: true,
}).extend({
  // choice 필드들은 프로그램 ID여야 함
  choice1: z.number().int().positive(),
  choice2: z.number().int().positive(),
  choice3: z.number().int().positive(),
});

export const insertAllocationSchema = createInsertSchema(allocations).omit({
  id: true,
  allocatedAt: true,
});

// 배치 수정 스키마 (programId만 수정 가능)
export const updateAllocationSchema = z.object({
  programId: z.number().int().positive(),
});

// Types
export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Allocation = typeof allocations.$inferSelect;
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;
export type UpdateAllocation = z.infer<typeof updateAllocationSchema>;
