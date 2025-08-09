import { 
  type Assignee,
  type InsertAssignee,
  type WorklogEntry,
  type InsertWorklogEntry
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Assignees
  getAssignees(): Promise<Assignee[]>;
  getAssignee(assigneeId: string): Promise<Assignee | undefined>;
  addAssignee(assignee: InsertAssignee): Promise<Assignee>;
  removeAssignee(assigneeId: string): Promise<void>;
  updateAssigneeInfo(assigneeId: string, name: string, email: string): Promise<Assignee>;
  
  // Worklog Entries
  getWorklogEntries(date?: string): Promise<WorklogEntry[]>;
  saveWorklogEntries(entries: InsertWorklogEntry[]): Promise<WorklogEntry[]>;
  clearWorklogEntriesForDate(date: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private assignees: Map<string, Assignee>;
  private worklogEntries: Map<string, WorklogEntry>;

  constructor() {
    this.assignees = new Map();
    this.worklogEntries = new Map();
    this.initializePreconfiguredAssignees();
  }

  private initializePreconfiguredAssignees(): void {
    const preconfiguredAssignees = [
      // Group PJ
      { assigneeId: '6310531bea661fd37d4f042a', group: 'PJ' },
      { assigneeId: '6172d230bcb57400683c2b26', group: 'PJ' },
      { assigneeId: '712020:310bd121-4bb2-4f01-8b57-714904f5173b', group: 'PJ' },
      { assigneeId: '712020:5250aaaa-d837-4a01-b4de-02c39ab1d798', group: 'PJ' },
      { assigneeId: '712020:e3b7ede2-e7a1-49f9-b0f0-936feef4e3a7', group: 'PJ' },
      { assigneeId: '712020:02822ff5-fc9b-44cf-b689-23f485aa21e7', group: 'PJ' },
      
      // Group AG
      { assigneeId: '5fcde79ffee793007501bfd0', group: 'AG' },
      { assigneeId: '712020:41db7dd0-6a8f-4cb2-b2f7-eb561d8c7ad4', group: 'AG' },
      { assigneeId: '63f328c0e2c4c692c976d233', group: 'AG' },
      { assigneeId: '712020:8a12e762-834f-4275-978d-abfc6c054b91', group: 'AG' },
      { assigneeId: '712020:91daf228-75c7-4065-83a4-868cc5c38db5', group: 'AG' },
      { assigneeId: '712020:40f4f0e6-1ff5-41b4-a503-056203b8bd3f', group: 'AG' },
      { assigneeId: '712020:7666dbdf-2547-4378-ad51-49d1e1ae0404', group: 'AG' },
      
      // Group LOS
      { assigneeId: '5e6b6d87fb668c0ce7ae3d9c', group: 'LOS' },
      { assigneeId: '5e33e03a9029c30ca0bcb575', group: 'LOS' },
      { assigneeId: '63f328c04c355259db9bcb77', group: 'LOS' },
      { assigneeId: '712020:26e66222-0759-4f5c-9f50-2ec08dc0a2ef', group: 'LOS' },
      { assigneeId: '712020:57691069-7afa-4907-9dca-fc5607364cf5', group: 'LOS' },
      { assigneeId: '62c7d9c4e16ddfe82be0a873', group: 'LOS' },
      { assigneeId: '712020:161e10b1-00f2-41ca-901e-d353513bfd0a', group: 'LOS' },
      { assigneeId: '62f3616dd49df231b629d715', group: 'LOS' },
      { assigneeId: '712020:6fd6f338-fcfe-42e9-8438-abb270461897', group: 'LOS' },
      { assigneeId: '712020:a65ab84d-ded3-4d2d-836b-00920f33ab25', group: 'LOS' },
    ];

    preconfiguredAssignees.forEach(({ assigneeId, group }) => {
      const assignee: Assignee = {
        id: `preconfigured-${assigneeId}`,
        assigneeId,
        name: null,
        email: null,
        group,
        isPreconfigured: true,
        isActive: true,
        createdAt: new Date(),
      };
      this.assignees.set(assigneeId, assignee);
    });
  }

  async getAssignees(): Promise<Assignee[]> {
    return Array.from(this.assignees.values()).filter(a => a.isActive);
  }

  async getAssignee(assigneeId: string): Promise<Assignee | undefined> {
    return this.assignees.get(assigneeId);
  }

  async addAssignee(insertAssignee: InsertAssignee): Promise<Assignee> {
    const id = randomUUID();
    const assignee: Assignee = {
      id,
      ...insertAssignee,
      name: insertAssignee.name || null,
      email: insertAssignee.email || null,
      group: insertAssignee.group || null,
      isPreconfigured: insertAssignee.isPreconfigured || false,
      isActive: insertAssignee.isActive !== false,
      createdAt: new Date(),
    };
    this.assignees.set(assignee.assigneeId, assignee);
    return assignee;
  }

  async removeAssignee(assigneeId: string): Promise<void> {
    const assignee = this.assignees.get(assigneeId);
    if (assignee && !assignee.isPreconfigured) {
      this.assignees.set(assigneeId, { ...assignee, isActive: false });
    }
  }

  async updateAssigneeInfo(assigneeId: string, name: string, email: string): Promise<Assignee> {
    const assignee = this.assignees.get(assigneeId);
    if (!assignee) {
      throw new Error("Assignee not found");
    }
    const updatedAssignee: Assignee = {
      ...assignee,
      name,
      email,
    };
    this.assignees.set(assigneeId, updatedAssignee);
    return updatedAssignee;
  }

  async getWorklogEntries(date?: string): Promise<WorklogEntry[]> {
    const entries = Array.from(this.worklogEntries.values());
    if (date) {
      return entries.filter(entry => entry.worklogDate === date);
    }
    return entries;
  }

  async saveWorklogEntries(entries: InsertWorklogEntry[]): Promise<WorklogEntry[]> {
    const savedEntries: WorklogEntry[] = [];
    
    for (const entry of entries) {
      const id = randomUUID();
      const worklogEntry: WorklogEntry = {
        id,
        ...entry,
        assigneeName: entry.assigneeName || null,
        taskSummary: entry.taskSummary || null,
        taskStatus: entry.taskStatus || null,
        createdAt: new Date(),
      };
      this.worklogEntries.set(id, worklogEntry);
      savedEntries.push(worklogEntry);
    }
    
    return savedEntries;
  }

  async clearWorklogEntriesForDate(date: string): Promise<void> {
    const entriesToDelete: string[] = [];
    this.worklogEntries.forEach((entry, id) => {
      if (entry.worklogDate === date) {
        entriesToDelete.push(id);
      }
    });
    
    entriesToDelete.forEach(id => {
      this.worklogEntries.delete(id);
    });
  }
}

export const storage = new MemStorage();
