import { 
  programs, 
  applications, 
  allocations,
  type Program, 
  type InsertProgram,
  type Application,
  type InsertApplication,
  type Allocation,
  type InsertAllocation,
  type UpdateAllocation
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Programs
  getAllPrograms(): Promise<Program[]>;
  getProgramById(id: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  deleteProgram(id: number): Promise<void>;

  // Applications
  getAllApplications(): Promise<Application[]>;
  getApplicationByStudentId(studentId: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(studentId: string, application: Partial<Application>): Promise<Application>;

  // Allocations
  getAllAllocations(): Promise<Allocation[]>;
  getAllocationById(id: number): Promise<Allocation | undefined>;
  createAllocation(allocation: InsertAllocation): Promise<Allocation>;
  updateAllocation(id: number, updates: Partial<Allocation>): Promise<Allocation>;
  clearAllocations(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Programs
  async getAllPrograms(): Promise<Program[]> {
    return await db.select().from(programs).orderBy(desc(programs.createdAt));
  }

  async getProgramById(id: number): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program || undefined;
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const [program] = await db
      .insert(programs)
      .values(insertProgram)
      .returning();
    return program;
  }

  async deleteProgram(id: number): Promise<void> {
    await db.delete(programs).where(eq(programs.id, id));
  }

  // Applications
  async getAllApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(desc(applications.lastSubmittedAt));
  }

  async getApplicationByStudentId(studentId: string): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.studentId, studentId));
    return application || undefined;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async updateApplication(studentId: string, updates: Partial<Application>): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set(updates)
      .where(eq(applications.studentId, studentId))
      .returning();
    return application;
  }

  // Allocations
  async getAllAllocations(): Promise<Allocation[]> {
    return await db.select().from(allocations).orderBy(desc(allocations.allocatedAt));
  }

  async getAllocationById(id: number): Promise<Allocation | undefined> {
    const [allocation] = await db.select().from(allocations).where(eq(allocations.id, id));
    return allocation || undefined;
  }

  async createAllocation(insertAllocation: InsertAllocation): Promise<Allocation> {
    const [allocation] = await db
      .insert(allocations)
      .values(insertAllocation)
      .returning();
    return allocation;
  }

  async updateAllocation(id: number, updates: Partial<Allocation>): Promise<Allocation> {
    const [allocation] = await db
      .update(allocations)
      .set(updates)
      .where(eq(allocations.id, id))
      .returning();
    return allocation;
  }

  async clearAllocations(): Promise<void> {
    await db.delete(allocations);
  }
}

export const storage = new DatabaseStorage();
