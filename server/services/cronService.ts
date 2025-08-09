import cron from 'node-cron';
import { storage } from '../storage';
import { JiraService } from './jiraService';
import { format, subDays, getDay } from 'date-fns';

export class CronService {
  private isJobRunning = false;

  startDailyJob(): void {
    // Run every day at 9 AM (configurable later)
    cron.schedule('0 9 * * *', async () => {
      if (this.isJobRunning) {
        console.log('Skipping scheduled job - already running');
        return;
      }

      this.isJobRunning = true;
      try {
        await this.runWorklogFetch();
      } catch (error) {
        console.error('Scheduled worklog fetch failed:', error);
      } finally {
        this.isJobRunning = false;
      }
    });

    console.log('Daily worklog cron job scheduled at 9:00 AM');
  }

  async runWorklogFetch(date?: string): Promise<void> {
    try {
      // Use environment variables for JIRA configuration
      const jiraUrl = process.env.JIRA_URL;
      const apiToken = process.env.JIRA_API_TOKEN;
      const userEmail = process.env.JIRA_USER_EMAIL;

      if (!jiraUrl || !apiToken || !userEmail) {
        throw new Error('JIRA environment variables not configured');
      }

      const assignees = await storage.getAssignees();
      if (assignees.length === 0) {
        console.log('No assignees configured, skipping worklog fetch');
        return;
      }

      const jiraService = new JiraService({
        jiraUrl,
        apiToken,
        userEmail,
      });

      const worklogDate = date || this.getPreviousWorkingDay();
      console.log(`Fetching worklog data for ${worklogDate}`);

      // Clear existing worklog entries for this date
      await storage.clearWorklogEntriesForDate(worklogDate);

      const allWorklogEntries = [];

      for (const assignee of assignees) {
        try {
          console.log(`Fetching tasks for assignee: ${assignee.assigneeId}`);
          
          // Get assignee info from JIRA if not available
          if (!assignee.name || !assignee.email) {
            const userInfo = await jiraService.getUserInfo(assignee.assigneeId);
            if (userInfo) {
              await storage.updateAssigneeInfo(
                assignee.assigneeId,
                userInfo.displayName,
                userInfo.emailAddress
              );
            }
          }

          const tasks = await jiraService.getTasksForAssignee(assignee.assigneeId, worklogDate);
          
          for (const task of tasks) {
            const worklogs = await jiraService.getWorklogsForTask(task.key, worklogDate);
            
            if (worklogs.length > 0) {
              const totalTimeSpent = worklogs.reduce((total, worklog) => total + worklog.timeSpentSeconds, 0);
              const hoursLogged = jiraService.formatTimeSpent(totalTimeSpent);

              allWorklogEntries.push({
                assigneeId: assignee.assigneeId,
                assigneeName: assignee.name || task.fields.assignee?.displayName || 'Unknown',
                taskKey: task.key,
                taskSummary: task.fields.summary,
                taskStatus: task.fields.status.name,
                hoursLogged,
                worklogDate,
              });
            }
          }
        } catch (error) {
          console.error(`Error processing assignee ${assignee.assigneeId}:`, error);
          // Continue with other assignees
        }
      }

      if (allWorklogEntries.length > 0) {
        await storage.saveWorklogEntries(allWorklogEntries);
        console.log(`Saved ${allWorklogEntries.length} worklog entries for ${worklogDate}`);
      } else {
        console.log(`No worklog entries found for ${worklogDate}`);
      }

    } catch (error) {
      console.error('Worklog fetch failed:', error);
      throw error;
    }
  }

  private getPreviousWorkingDay(): string {
    const today = new Date();
    let previousDay = subDays(today, 1);
    
    // If today is Monday (1), go back to Friday
    if (getDay(today) === 1) {
      previousDay = subDays(today, 3);
    }
    
    return format(previousDay, 'yyyy-MM-dd');
  }
}

export const cronService = new CronService();
