import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cronService } from "./services/cronService";
import { JiraService } from "./services/jiraService";
import { insertAssigneeSchema } from "@shared/schema";
import { format, subDays, getDay } from 'date-fns';

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the cron service
  cronService.startDailyJob();

  // Test JIRA connection using environment variables
  app.post("/api/test-connection", async (req, res) => {
    try {
      const jiraUrl = process.env.JIRA_URL;
      const apiToken = process.env.JIRA_API_TOKEN;
      const userEmail = process.env.JIRA_USER_EMAIL;
      
      if (!jiraUrl || !apiToken || !userEmail) {
        return res.status(400).json({ message: "JIRA environment variables not configured" });
      }

      const jiraService = new JiraService({ jiraUrl, apiToken, userEmail });
      const isConnected = await jiraService.testConnection();
      
      if (isConnected) {
        res.json({ success: true, message: "Successfully connected to JIRA" });
      } else {
        res.status(400).json({ success: false, message: "Failed to connect to JIRA" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Connection test failed" });
    }
  });

  // Get assignees
  app.get("/api/assignees", async (req, res) => {
    try {
      const assignees = await storage.getAssignees();
      res.json(assignees);
    } catch (error) {
      res.status(500).json({ message: "Failed to get assignees" });
    }
  });

  // Add assignee
  app.post("/api/assignees", async (req, res) => {
    try {
      const validatedData = insertAssigneeSchema.parse(req.body);
      
      // Check if assignee already exists
      const existing = await storage.getAssignee(validatedData.assigneeId);
      if (existing && existing.isActive) {
        return res.status(400).json({ message: "Assignee already exists" });
      }

      const assignee = await storage.addAssignee(validatedData);
      res.json(assignee);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid assignee data" });
    }
  });

  // Remove assignee
  app.delete("/api/assignees/:assigneeId", async (req, res) => {
    try {
      const { assigneeId } = req.params;
      await storage.removeAssignee(assigneeId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove assignee" });
    }
  });

  // Get dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const { date, group } = req.query;
      const worklogDate = date as string || getPreviousWorkingDay();
      const selectedGroup = group as string;
      
      const worklogEntries = await storage.getWorklogEntries(worklogDate);
      
      // Calculate summary data
      const assigneeData = new Map();
      let totalHoursNum = 0;
      const tasks = [];

      for (const entry of worklogEntries) {
        // Parse hours (remove 'h' and convert to number)
        const hours = parseFloat(entry.hoursLogged.replace('h', ''));
        totalHoursNum += hours;

        // Group by assignee
        if (!assigneeData.has(entry.assigneeId)) {
          assigneeData.set(entry.assigneeId, {
            assigneeId: entry.assigneeId,
            name: entry.assigneeName || 'Unknown',
            email: '',
            initials: getInitials(entry.assigneeName || 'Unknown'),
            tasksCount: 0,
            hoursLogged: 0,
            status: 'Active' as const,
          });
        }

        const assigneeInfo = assigneeData.get(entry.assigneeId);
        assigneeInfo.tasksCount += 1;
        assigneeInfo.hoursLogged += hours;

        // Add task
        tasks.push({
          key: entry.taskKey,
          summary: entry.taskSummary || '',
          status: entry.taskStatus || '',
          assignee: entry.assigneeName || 'Unknown',
          worklogHours: entry.hoursLogged,
        });
      }

      // Convert assignee data to array and calculate progress
      const assigneeWorklogs = Array.from(assigneeData.values()).map(assignee => ({
        ...assignee,
        hoursLogged: `${assignee.hoursLogged}h`,
        progressPercent: Math.min(Math.round((assignee.hoursLogged / 8) * 100), 100), // Assuming 8h target
      }));

      // Add inactive assignees
      const allAssignees = await storage.getAssignees();
      const filteredAssignees = selectedGroup 
        ? allAssignees.filter(a => a.group === selectedGroup)
        : allAssignees;
        
      for (const assignee of filteredAssignees) {
        if (!assigneeData.has(assignee.assigneeId)) {
          assigneeWorklogs.push({
            assigneeId: assignee.assigneeId,
            name: assignee.name || 'Unknown',
            email: assignee.email || '',
            initials: getInitials(assignee.name || 'Unknown'),
            tasksCount: 0,
            hoursLogged: '0h',
            progressPercent: 0,
            status: 'Inactive' as const,
            group: assignee.group || undefined,
            isPreconfigured: assignee.isPreconfigured || false,
          });
        }
      }

      // Filter worklog data and tasks if group is selected
      let filteredWorklogData = assigneeWorklogs;
      let filteredTasks = tasks;
      
      if (selectedGroup) {
        const groupAssigneeIds = filteredAssignees.map(a => a.assigneeId);
        filteredWorklogData = assigneeWorklogs.filter(a => groupAssigneeIds.includes(a.assigneeId));
        filteredTasks = tasks.filter(t => {
          const assignee = allAssignees.find(a => a.name === t.assignee);
          return assignee && groupAssigneeIds.includes(assignee.assigneeId);
        });
        
        // Recalculate totals for the group
        totalHoursNum = filteredWorklogData.reduce((total, a) => {
          return total + parseFloat(a.hoursLogged.replace('h', ''));
        }, 0);
      }
      const dashboardData = {
        totalHours: `${totalHoursNum}h`,
        activeAssignees: filteredWorklogData.filter(a => a.status === 'Active').length,
        tasksWorked: filteredTasks.length,
        worklogDate: formatDateDisplay(worklogDate),
        assigneeWorklogs: filteredWorklogData,
        tasks: filteredTasks,
        selectedGroup: selectedGroup || null,
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Dashboard data error:', error);
      res.status(500).json({ message: "Failed to get dashboard data" });
    }
  });

  // Manual refresh worklog data
  app.post("/api/refresh", async (req, res) => {
    try {
      const { date } = req.body;
      await cronService.runWorklogFetch(date);
      res.json({ success: true, message: "Worklog data refreshed successfully" });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to refresh worklog data" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getPreviousWorkingDay(): string {
  const today = new Date();
  let previousDay = subDays(today, 1);
  
  // If today is Monday (1), go back to Friday
  if (getDay(today) === 1) {
    previousDay = subDays(today, 3);
  }
  
  return format(previousDay, 'yyyy-MM-dd');
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'EEEE, MMMM d, yyyy');
}
