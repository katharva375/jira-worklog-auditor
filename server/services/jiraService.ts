import axios from 'axios';
import { format, subDays, getDay } from 'date-fns';

export interface JiraConfig {
  jiraUrl: string;
  apiToken: string;
  userEmail: string;
}

export interface JiraTask {
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee: {
      displayName: string;
      emailAddress: string;
    };
  };
}

export interface JiraWorklog {
  timeSpentSeconds: number;
  started: string;
  author: {
    displayName: string;
    emailAddress: string;
  };
}

export class JiraService {
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
  }

  private getAuthHeader(): string {
    const auth = Buffer.from(`${this.config.userEmail}:${this.config.apiToken}`).toString('base64');
    return `Basic ${auth}`;
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

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.jiraUrl}/rest/api/3/myself`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('JIRA connection test failed:', error);
      return false;
    }
  }

  async getTasksForAssignee(assigneeId: string, date?: string): Promise<JiraTask[]> {
    const worklogDate = date || this.getPreviousWorkingDay();
    const jql = `worklogDate = '${worklogDate}' AND assignee = ${assigneeId}`;
    
    try {
      const response = await axios.get(`${this.config.jiraUrl}/rest/api/3/search`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
        params: {
          jql,
          fields: 'summary,status,assignee',
          maxResults: 100,
        },
        timeout: 30000,
      });
      
      return response.data.issues || [];
    } catch (error) {
      console.error(`Failed to fetch tasks for assignee ${assigneeId}:`, error);
      throw new Error(`Failed to fetch JIRA tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWorklogsForTask(taskKey: string, date: string): Promise<JiraWorklog[]> {
    try {
      const response = await axios.get(`${this.config.jiraUrl}/rest/api/3/issue/${taskKey}/worklog`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
        timeout: 15000,
      });
      
      const worklogs = response.data.worklogs || [];
      
      // Filter worklogs for the specific date
      return worklogs.filter((worklog: JiraWorklog) => {
        const worklogDate = format(new Date(worklog.started), 'yyyy-MM-dd');
        return worklogDate === date;
      });
    } catch (error) {
      console.error(`Failed to fetch worklogs for task ${taskKey}:`, error);
      return [];
    }
  }

  async getUserInfo(assigneeId: string): Promise<{ displayName: string; emailAddress: string } | null> {
    try {
      const response = await axios.get(`${this.config.jiraUrl}/rest/api/3/user`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
        params: {
          accountId: assigneeId,
        },
        timeout: 10000,
      });
      
      return {
        displayName: response.data.displayName,
        emailAddress: response.data.emailAddress,
      };
    } catch (error) {
      console.error(`Failed to fetch user info for ${assigneeId}:`, error);
      return null;
    }
  }

  formatTimeSpent(timeSpentSeconds: number): string {
    const hours = Math.round((timeSpentSeconds / 3600) * 10) / 10;
    return `${hours}h`;
  }
}
