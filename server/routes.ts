import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { testExecutor } from "./test-executor";
import { insertTestSchema, insertScheduleSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket setup for real-time test execution updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    const logHandler = (runId: string, message: string) => {
      ws.send(JSON.stringify({ type: 'log', runId, message }));
    };

    const progressHandler = (runId: string, progress: number) => {
      ws.send(JSON.stringify({ type: 'progress', runId, progress }));
    };

    const completeHandler = (runId: string, success: boolean) => {
      ws.send(JSON.stringify({ type: 'complete', runId, success }));
    };

    testExecutor.on('log', logHandler);
    testExecutor.on('progress', progressHandler);
    testExecutor.on('complete', completeHandler);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      testExecutor.off('log', logHandler);
      testExecutor.off('progress', progressHandler);
      testExecutor.off('complete', completeHandler);
    });
  });

  // Test CRUD routes
  app.get('/api/tests', async (req, res) => {
    try {
      const tests = await storage.getAllTests();
      res.json(tests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/tests/:id', async (req, res) => {
    try {
      const test = await storage.getTest(req.params.id);
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/tests', async (req, res) => {
    try {
      const validatedData = insertTestSchema.parse(req.body);
      const test = await storage.createTest(validatedData);
      res.status(201).json(test);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/tests/:id', async (req, res) => {
    try {
      const validatedData = insertTestSchema.partial().parse(req.body);
      const test = await storage.updateTest(req.params.id, validatedData);
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }
      res.json(test);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/tests/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteTest(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Test not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test execution routes
  app.post('/api/tests/:id/run', async (req, res) => {
    try {
      const test = await storage.getTest(req.params.id);
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      const runId = await testExecutor.executeTest(test);
      res.json({ runId, message: 'Test execution started' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/test-runs/:id/stop', async (req, res) => {
    try {
      const stopped = await testExecutor.stopTest(req.params.id);
      if (!stopped) {
        return res.status(404).json({ error: 'Test run not found or already completed' });
      }
      res.json({ message: 'Test execution stopped' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test run routes
  app.get('/api/test-runs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const testRuns = await storage.getAllTestRuns(limit);
      res.json(testRuns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/test-runs/:id', async (req, res) => {
    try {
      const testRun = await storage.getTestRun(req.params.id);
      if (!testRun) {
        return res.status(404).json({ error: 'Test run not found' });
      }
      res.json(testRun);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/tests/:id/runs', async (req, res) => {
    try {
      const testRuns = await storage.getTestRunsByTestId(req.params.id);
      res.json(testRuns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Schedule routes
  app.get('/api/schedules', async (req, res) => {
    try {
      const schedules = await storage.getAllSchedules();
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/schedules', async (req, res) => {
    try {
      const validatedData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/schedules/:id', async (req, res) => {
    try {
      const validatedData = insertScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateSchedule(req.params.id, validatedData);
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/schedules/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteSchedule(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stats route for dashboard metrics
  app.get('/api/stats', async (req, res) => {
    try {
      const allTests = await storage.getAllTests();
      const allTestRuns = await storage.getAllTestRuns(100);
      
      const totalTests = allTests.length;
      const recentRuns = allTestRuns.slice(0, 50);
      const passedRuns = recentRuns.filter(run => run.status === 'passed').length;
      const failedRuns = recentRuns.filter(run => run.status === 'failed').length;
      const passRate = recentRuns.length > 0 ? (passedRuns / recentRuns.length * 100).toFixed(1) : '0.0';
      
      const completedRuns = recentRuns.filter(run => run.duration !== null);
      const avgDuration = completedRuns.length > 0
        ? (completedRuns.reduce((sum, run) => sum + (run.duration || 0), 0) / completedRuns.length / 1000).toFixed(1)
        : '0.0';

      res.json({
        totalTests,
        passRate: `${passRate}%`,
        failedTests: failedRuns,
        avgDuration: `${avgDuration}s`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
