import { Badge } from "@/components/ui/badge";

interface AssigneeWorklog {
  assigneeId: string;
  name: string;
  email: string;
  initials: string;
  tasksCount: number;
  hoursLogged: string;
  progressPercent: number;
  status: 'Active' | 'Inactive';
  group?: string;
  isPreconfigured?: boolean;
}

interface WorklogTableProps {
  data: AssigneeWorklog[];
  currentDate: string;
}

const avatarColors = [
  'bg-blue-500',
  'bg-purple-500', 
  'bg-emerald-500',
  'bg-amber-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-green-500',
];

export default function WorklogTable({ data, currentDate }: WorklogTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Assignee Worklog Breakdown</h2>
        <p className="text-sm text-gray-500 mt-1">Individual worklog hours for {currentDate}</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tasks Completed
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours Logged
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <p className="text-sm">No worklog data available</p>
                    <p className="text-xs mt-1">Configure assignees and refresh to see data</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((assignee, index) => (
                <tr key={assignee.assigneeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center`}>
                          <span className="text-sm font-medium text-white">{assignee.initials}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{assignee.name}</div>
                        <div className="text-sm text-gray-500">{assignee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignee.tasksCount}</div>
                    <div className="text-sm text-gray-500">tasks</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignee.hoursLogged}</div>
                    <div className="text-sm text-gray-500">logged</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${assignee.progressPercent === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                        style={{ width: `${Math.min(assignee.progressPercent, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{assignee.progressPercent}% of target</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={assignee.status === 'Active' ? 'default' : 'secondary'}>
                      {assignee.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
