import { Badge } from "@/components/ui/badge";
import { User, Clock } from "lucide-react";

interface Task {
  key: string;
  summary: string;
  status: string;
  assignee: string;
  worklogHours: string;
}

interface TaskDetailsProps {
  tasks: Task[];
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('done') || lowerStatus.includes('completed')) return 'default';
  if (lowerStatus.includes('progress') || lowerStatus.includes('review')) return 'secondary';
  return 'secondary';
};

const getStatusColor = (status: string): string => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('done') || lowerStatus.includes('completed')) return 'bg-green-100 text-green-800';
  if (lowerStatus.includes('progress')) return 'bg-blue-100 text-blue-800';
  if (lowerStatus.includes('review')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

export default function TaskDetails({ tasks }: TaskDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
        <p className="text-sm text-gray-500 mt-1">Individual tasks and their worklog entries</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {tasks.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-500">
              <p className="text-sm">No tasks with worklog entries found</p>
              <p className="text-xs mt-1">Tasks will appear here after worklog data is fetched</p>
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.key} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900">{task.key}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.summary}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{task.assignee}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{task.worklogHours} logged</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{task.worklogHours}</div>
                  <div className="text-xs text-gray-500">worklog</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
