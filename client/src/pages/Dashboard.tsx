import { useState } from "react";
import { ChartLine, RefreshCw, Settings, Users, Filter } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import SettingsModal from "@/components/SettingsModal";
import SummaryCards from "@/components/SummaryCards";
import WorklogTable from "@/components/WorklogTable";
import TaskDetails from "@/components/TaskDetails";
import { useWorklogData } from "@/hooks/useWorklogData";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  
  const { data: dashboardData, isLoading, refetch } = useWorklogData(selectedGroup, selectedDate);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const dateParam = selectedDate ? { date: format(selectedDate, 'yyyy-MM-dd') } : {};
      await apiRequest('POST', '/api/refresh', dateParam);
      await refetch();
      toast({
        title: "Data Refreshed",
        description: `Worklog data has been updated for ${selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'the latest workday'}`,
      });
    } catch (error) {
      toast({
        title: "Refresh Failed", 
        description: error instanceof Error ? error.message : "Failed to refresh worklog data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                    <ChartLine className="text-white" size={16} />
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">JIRA Worklog Dashboard</h1>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">Loading worklog data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                  <ChartLine className="text-white" size={16} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">JIRA Worklog Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SummaryCards 
          data={{...dashboardData, selectedGroup}} 
          onGroupSelect={setSelectedGroup}
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
        />
        <div className="mt-8">
          <WorklogTable data={dashboardData?.assigneeWorklogs || []} currentDate={dashboardData?.worklogDate || ''} />
        </div>
        <div className="mt-8">
          <TaskDetails tasks={dashboardData?.tasks || []} />
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
