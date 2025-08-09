import { useState, useEffect } from "react";
import { X, Plus, Trash2, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Assignee {
  id: string;
  assigneeId: string;
  name?: string;
  email?: string;
  group?: string;
  isPreconfigured?: boolean;
  isActive: boolean;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [assigneeIds, setAssigneeIds] = useState<string[]>(['']);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignees = [] } = useQuery<Assignee[]>({
    queryKey: ['/api/assignees'],
    enabled: isOpen,
  });

  const addAssigneeMutation = useMutation({
    mutationFn: (assigneeId: string) => apiRequest('POST', '/api/assignees', { assigneeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignees'] });
    },
  });

  const removeAssigneeMutation = useMutation({
    mutationFn: (assigneeId: string) => apiRequest('DELETE', `/api/assignees/${assigneeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignees'] });
    },
  });

  useEffect(() => {
    if (assignees.length > 0) {
      const userAddedAssignees = assignees.filter(a => !a.isPreconfigured);
      setAssigneeIds([...userAddedAssignees.map(a => a.assigneeId), '']);
    }
  }, [assignees]);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await apiRequest('POST', '/api/test-connection', {});
      
      toast({
        title: "Connection Successful",
        description: "Successfully connected to JIRA API using environment variables",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to JIRA",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Save new assignees
      const newAssigneeIds = assigneeIds.filter(id => id.trim() && !assignees.some(a => a.assigneeId === id));
      
      // Check for the specific assignee ID that should be blocked
      const blockedAssigneeId = '712020:021cc494-3a62-45a8-bd3d-db7e0a9dd057';
      if (newAssigneeIds.some(id => id.trim() === blockedAssigneeId)) {
        toast({
          title: "Cannot Add Assignee",
          description: "Cannot betray Master, please check Atharva's worklog manually",
          variant: "destructive",
        });
        return;
      }
      
      for (const assigneeId of newAssigneeIds) {
        await addAssigneeMutation.mutateAsync(assigneeId.trim());
      }

      toast({
        title: "Settings Saved",
        description: "Assignees have been saved successfully",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save assignees",
        variant: "destructive",
      });
    }
  };

  const addAssigneeField = () => {
    setAssigneeIds([...assigneeIds, '']);
  };

  const updateAssigneeId = (index: number, value: string) => {
    const newIds = [...assigneeIds];
    newIds[index] = value;
    setAssigneeIds(newIds);
  };

  const removeAssigneeField = (index: number) => {
    const assigneeId = assigneeIds[index];
    if (assigneeId && assignees.some(a => a.assigneeId === assigneeId && !a.isPreconfigured)) {
      removeAssigneeMutation.mutate(assigneeId);
    }
    
    const newIds = assigneeIds.filter((_, i) => i !== index);
    setAssigneeIds(newIds);
  };

  // Group assignees by group
  const groupedAssignees = assignees.reduce((groups, assignee) => {
    if (assignee.isPreconfigured) {
      const group = assignee.group || 'Other';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(assignee);
    }
    return groups;
  }, {} as Record<string, Assignee[]>);

  const userAddedAssignees = assignees.filter(a => !a.isPreconfigured);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
                Assignee Management
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* JIRA Connection Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">JIRA Connection</h4>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    JIRA credentials are securely configured via environment variables.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="mt-2"
                  >
                    {isTestingConnection ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
              </div>

              {/* Assignee Management Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Add New Assignees</h4>
                  <Button variant="outline" size="sm" onClick={addAssigneeField}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Assignee
                  </Button>
                </div>
                
                {/* Preconfigured Assignees Groups */}
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Preconfigured Groups</h5>
                  <div className="space-y-4">
                    {Object.entries(groupedAssignees).map(([groupName, groupAssignees]) => (
                      <div key={groupName} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <h6 className="font-medium text-gray-900">Group {groupName}</h6>
                            <Badge variant="secondary">{groupAssignees.length} assignees</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                          {groupAssignees.map((assignee, index) => (
                            <div key={assignee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="font-mono text-xs">
                                {assignee.assigneeId}
                              </span>
                              {assignee.name && (
                                <span className="text-gray-500">
                                  {assignee.name}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Added Assignees */}
                {userAddedAssignees.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Your Added Assignees</h5>
                    <div className="space-y-2">
                      {userAddedAssignees.map((assignee) => (
                        <div key={assignee.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                          <span className="font-mono text-sm">{assignee.assigneeId}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssigneeMutation.mutate(assignee.assigneeId)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Assignee Fields */}
                <div className="space-y-2">
                  {assigneeIds.map((assigneeId, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                      <Input
                        placeholder="712020:021cc494-3a62-45a8-bd3d-db7e0a9dd057"
                        value={assigneeId}
                        onChange={(e) => updateAssigneeId(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAssigneeField(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  Add new assignee IDs that are not in the preconfigured groups
                </p>
              </div>

            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              onClick={handleSaveSettings}
              disabled={addAssigneeMutation.isPending}
              className="w-full sm:w-auto sm:ml-3"
            >
              {addAssigneeMutation.isPending ? "Saving..." : "Save Assignees"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
