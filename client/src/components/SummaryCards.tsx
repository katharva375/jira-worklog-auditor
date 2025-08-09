import { Clock, Users, CheckSquare, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface SummaryCardsProps {
  data?: {
    totalHours: string;
    activeAssignees: number;
    tasksWorked: number;
    worklogDate: string;
    selectedGroup?: string | null;
  };
  onGroupSelect?: (group: string | null) => void;
  onDateSelect?: (date: Date | undefined) => void;
  selectedDate?: Date;
}

export default function SummaryCards({ data, onGroupSelect, onDateSelect, selectedDate }: SummaryCardsProps) {
  if (!data) {
    return (
      <div>
        <div className="mb-6 flex justify-end">
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group cards for filtering
  const groups = ['PJ', 'AG', 'LOS'];
  const selectedGroup = data.selectedGroup;

  return (
    <div>
      {/* Date Picker */}
      <div className="mb-6 flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Select date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Group filter cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {['PJ', 'AG', 'LOS'].map((group) => (
          <div 
            key={group}
            onClick={() => onGroupSelect?.(data.selectedGroup === group ? null : group)}
            className={`bg-white rounded-lg shadow-sm border ${data.selectedGroup === group ? 'border-brand-500' : 'border-gray-200'} p-6 cursor-pointer hover:border-brand-500 transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Group</p>
                <p className="text-xl font-bold text-gray-900">{group}</p>
                <p className="text-xs text-gray-500 mt-1">Click to filter</p>
              </div>
              <div className={`w-8 h-8 ${data.selectedGroup === group ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'} rounded-full flex items-center justify-center`}>
                <Users className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Regular summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Hours Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Hours Logged</p>
            <p className="text-3xl font-bold text-gray-900">
              {parseFloat(data.totalHours.replace('h', '')).toFixed(2)}h
            </p>
            <p className="text-xs text-gray-500 mt-1">{data.worklogDate}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Clock className="text-blue-600 h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Active Assignees Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Assignees</p>
            <p className="text-3xl font-bold text-gray-900">{data.activeAssignees}</p>
            <p className="text-xs text-green-600 mt-1">
              <i className="fas fa-arrow-up text-xs"></i>
              Logged today
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="text-green-600 h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tasks Worked Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Tasks Worked</p>
            <p className="text-3xl font-bold text-gray-900">{data.tasksWorked}</p>
            <p className="text-xs text-gray-500 mt-1">Across all assignees</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <CheckSquare className="text-purple-600 h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
