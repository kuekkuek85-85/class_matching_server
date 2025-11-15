import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProgramSchema, insertApplicationSchema, updateAllocationSchema, type Allocation } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS 설정 - 모든 origin 허용
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    
    next();
  });

  // ===== 프로그램 관리 API =====
  
  // GET /api/programs - 프로그램 목록 조회
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getAllPrograms();
      res.json(programs);
    } catch (error) {
      console.error("프로그램 조회 실패:", error);
      res.status(500).json({ message: "프로그램 조회에 실패했습니다." });
    }
  });

  // POST /api/programs - 프로그램 등록
  app.post("/api/programs", async (req, res) => {
    try {
      const validatedData = insertProgramSchema.parse(req.body);
      const program = await storage.createProgram(validatedData);
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "잘못된 입력입니다.", errors: error.errors });
      }
      console.error("프로그램 등록 실패:", error);
      res.status(500).json({ message: "프로그램 등록에 실패했습니다." });
    }
  });

  // DELETE /api/programs/:id - 프로그램 삭제
  app.delete("/api/programs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "유효하지 않은 프로그램 ID입니다." });
      }

      const program = await storage.getProgramById(id);
      if (!program) {
        return res.status(404).json({ message: "프로그램을 찾을 수 없습니다." });
      }

      await storage.deleteProgram(id);
      res.json({ message: "프로그램이 삭제되었습니다." });
    } catch (error) {
      console.error("프로그램 삭제 실패:", error);
      res.status(500).json({ message: "프로그램 삭제에 실패했습니다." });
    }
  });

  // ===== 학생 신청 API =====

  // POST /api/applications - 신청 제출/재제출
  app.post("/api/applications", async (req, res) => {
    try {
      // 기본 검증
      const validatedData = insertApplicationSchema.parse(req.body);
      
      // 기존 신청 확인
      const existingApplication = await storage.getApplicationByStudentId(validatedData.studentId);

      if (existingApplication) {
        // 재제출 - phone과 birthdate 필수
        if (!validatedData.phone || !validatedData.birthdate) {
          return res.status(400).json({ 
            message: "이미 신청한 학번입니다. 재제출 시 전화번호와 생년월일을 입력해주세요.",
            requiresAdditionalInfo: true
          });
        }

        // 기존에 phone이 저장되어 있다면 검증
        if (existingApplication.phone && existingApplication.phone !== validatedData.phone) {
          return res.status(403).json({ 
            message: "전화번호가 일치하지 않습니다. 본인 확인이 필요합니다.",
          });
        }

        // 기존에 birthdate가 저장되어 있다면 검증
        if (existingApplication.birthdate && existingApplication.birthdate !== validatedData.birthdate) {
          return res.status(403).json({ 
            message: "생년월일이 일치하지 않습니다. 본인 확인이 필요합니다.",
          });
        }

        // 재제출 처리 (기존에 없었다면 이번에 저장)
        const updatedApplication = await storage.updateApplication(
          validatedData.studentId,
          {
            name: validatedData.name,
            phone: validatedData.phone,
            birthdate: validatedData.birthdate,
            choice1: validatedData.choice1,
            choice2: validatedData.choice2,
            choice3: validatedData.choice3,
            submissionCount: existingApplication.submissionCount + 1,
            lastSubmittedAt: new Date(),
          }
        );

        return res.json({ 
          message: "신청이 재제출되었습니다.",
          application: updatedApplication 
        });
      }

      // 최초 제출
      const application = await storage.createApplication(validatedData);
      res.status(201).json({ 
        message: "신청이 제출되었습니다.",
        application 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "잘못된 입력입니다.", errors: error.errors });
      }
      console.error("신청 제출 실패:", error);
      res.status(500).json({ message: "신청 제출에 실패했습니다." });
    }
  });

  // GET /api/applications - 신청 현황 조회
  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      const programs = await storage.getAllPrograms();

      // 프로그램별 지망 통계 계산
      const programStats = programs.map(program => {
        const choice1Count = applications.filter(app => app.choice1 === program.id).length;
        const choice2Count = applications.filter(app => app.choice2 === program.id).length;
        const choice3Count = applications.filter(app => app.choice3 === program.id).length;
        const totalCount = choice1Count + choice2Count + choice3Count;

        return {
          programId: program.id,
          programName: program.name,
          quota: program.quota,
          choice1Count,
          choice2Count,
          choice3Count,
          totalCount,
        };
      });

      res.json({
        applications,
        programStats,
        totalApplications: applications.length,
      });
    } catch (error) {
      console.error("신청 현황 조회 실패:", error);
      res.status(500).json({ message: "신청 현황 조회에 실패했습니다." });
    }
  });

  // ===== 배치 API =====

  // POST /api/allocate - 배치 실행
  app.post("/api/allocate", async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      const programs = await storage.getAllPrograms();

      if (applications.length === 0) {
        return res.status(400).json({ message: "배치할 신청이 없습니다." });
      }

      // 기존 배치 초기화
      await storage.clearAllocations();

      // 프로그램별 남은 정원 추적
      const remainingQuotas = new Map<number, number>();
      programs.forEach(program => {
        remainingQuotas.set(program.id, program.quota);
      });

      // 학생 무작위 섞기
      const shuffledApplications = [...applications].sort(() => Math.random() - 0.5);

      // 배치 결과 저장
      const allocations: Allocation[] = [];

      // 1지망부터 3지망까지 순서대로 배치
      for (const choiceRank of [1, 2, 3]) {
        for (const application of shuffledApplications) {
          // 이미 배치된 학생은 건너뛰기
          if (allocations.some(a => a.studentId === application.studentId)) {
            continue;
          }

          const programId = choiceRank === 1 ? application.choice1 
                          : choiceRank === 2 ? application.choice2 
                          : application.choice3;

          const remaining = remainingQuotas.get(programId) || 0;

          // 정원이 남아있으면 배치
          if (remaining > 0) {
            const allocation = await storage.createAllocation({
              studentId: application.studentId,
              programId: programId,
              choiceRank: choiceRank,
              allocationType: "자동배치",
            });

            allocations.push(allocation);
            remainingQuotas.set(programId, remaining - 1);
          }
        }
      }

      // 배치되지 않은 학생 수 계산
      const unallocatedCount = applications.length - allocations.length;

      res.json({
        message: "배치가 완료되었습니다.",
        totalStudents: applications.length,
        allocatedCount: allocations.length,
        unallocatedCount: unallocatedCount,
        allocations,
      });
    } catch (error) {
      console.error("배치 실행 실패:", error);
      res.status(500).json({ message: "배치 실행에 실패했습니다." });
    }
  });

  // GET /api/allocate/results - 배치 결과 조회
  app.get("/api/allocate/results", async (req, res) => {
    try {
      const allocations = await storage.getAllAllocations();
      const applications = await storage.getAllApplications();
      const programs = await storage.getAllPrograms();

      // 배치 결과에 학생 이름과 프로그램 이름 추가
      const enrichedAllocations = allocations.map(allocation => {
        const application = applications.find(app => app.studentId === allocation.studentId);
        const program = programs.find(prog => prog.id === allocation.programId);

        return {
          ...allocation,
          studentName: application?.name || "알 수 없음",
          programName: program?.name || "알 수 없음",
        };
      });

      // 프로그램별 배치 통계
      const programAllocationStats = programs.map(program => {
        const allocated = allocations.filter(a => a.programId === program.id);
        return {
          programId: program.id,
          programName: program.name,
          quota: program.quota,
          allocatedCount: allocated.length,
          remainingQuota: program.quota - allocated.length,
          choice1Count: allocated.filter(a => a.choiceRank === 1).length,
          choice2Count: allocated.filter(a => a.choiceRank === 2).length,
          choice3Count: allocated.filter(a => a.choiceRank === 3).length,
        };
      });

      res.json({
        allocations: enrichedAllocations,
        programStats: programAllocationStats,
        totalAllocated: allocations.length,
        totalUnallocated: applications.length - allocations.length,
      });
    } catch (error) {
      console.error("배치 결과 조회 실패:", error);
      res.status(500).json({ message: "배치 결과 조회에 실패했습니다." });
    }
  });

  // PATCH /api/allocate/:id - 배치 결과 수정
  app.patch("/api/allocate/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "유효하지 않은 배치 ID입니다." });
      }

      // 기존 배치 확인
      const existingAllocation = await storage.getAllocationById(id);
      if (!existingAllocation) {
        return res.status(404).json({ message: "배치를 찾을 수 없습니다." });
      }

      // 요청 데이터 검증
      const validatedData = updateAllocationSchema.parse(req.body);
      const newProgramId = validatedData.programId;

      // 같은 프로그램으로 변경하려는 경우
      if (existingAllocation.programId === newProgramId) {
        return res.status(400).json({ message: "이미 해당 프로그램에 배치되어 있습니다." });
      }

      // 새 프로그램 존재 확인
      const newProgram = await storage.getProgramById(newProgramId);
      if (!newProgram) {
        return res.status(404).json({ message: "존재하지 않는 프로그램입니다." });
      }

      // 정원 체크: 새 프로그램의 현재 배치 인원 확인
      const allAllocations = await storage.getAllAllocations();
      const newProgramAllocations = allAllocations.filter(a => a.programId === newProgramId);
      
      if (newProgramAllocations.length >= newProgram.quota) {
        return res.status(400).json({ 
          message: `${newProgram.name}의 정원이 가득 찼습니다. (현재 ${newProgramAllocations.length}/${newProgram.quota})` 
        });
      }

      // 학생의 지망 순위 계산
      const application = await storage.getApplicationByStudentId(existingAllocation.studentId);
      let newChoiceRank = 0; // 지망 외 (수동 배치)

      if (application) {
        if (application.choice1 === newProgramId) newChoiceRank = 1;
        else if (application.choice2 === newProgramId) newChoiceRank = 2;
        else if (application.choice3 === newProgramId) newChoiceRank = 3;
      }

      // 배치 업데이트
      const updatedAllocation = await storage.updateAllocation(id, {
        programId: newProgramId,
        choiceRank: newChoiceRank,
        allocationType: "수동배치", // 수동으로 변경된 배치
      });

      // 프로그램 정보 추가
      const oldProgram = await storage.getProgramById(existingAllocation.programId);
      
      res.json({
        message: "배치가 수정되었습니다.",
        allocation: updatedAllocation,
        changes: {
          from: {
            programId: existingAllocation.programId,
            programName: oldProgram?.name || "알 수 없음",
          },
          to: {
            programId: newProgramId,
            programName: newProgram.name,
          }
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "잘못된 입력입니다.", errors: error.errors });
      }
      console.error("배치 수정 실패:", error);
      res.status(500).json({ message: "배치 수정에 실패했습니다." });
    }
  });

  // GET /api/allocate/export - CSV 다운로드
  app.get("/api/allocate/export", async (req, res) => {
    try {
      const allocations = await storage.getAllAllocations();
      const applications = await storage.getAllApplications();
      const programs = await storage.getAllPrograms();

      if (allocations.length === 0) {
        return res.status(404).json({ message: "다운로드할 배치 결과가 없습니다." });
      }

      // CSV 헤더
      const headers = ["학번", "이름", "배치된 프로그램", "지망 순위"];
      
      // CSV 데이터 생성
      const rows = allocations.map(allocation => {
        const application = applications.find(app => app.studentId === allocation.studentId);
        const program = programs.find(prog => prog.id === allocation.programId);

        return [
          allocation.studentId,
          application?.name || "",
          program?.name || "",
          allocation.choiceRank.toString(),
        ];
      });

      // CSV 문자열 생성 (UTF-8 BOM 추가로 한글 깨짐 방지)
      const BOM = "\uFEFF";
      const csvContent = BOM + [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      // CSV 파일로 응답
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="allocation_results_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("CSV 다운로드 실패:", error);
      res.status(500).json({ message: "CSV 다운로드에 실패했습니다." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
