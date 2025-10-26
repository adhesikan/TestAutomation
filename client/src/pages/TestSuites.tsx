import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Test } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TestConfigForm from "@/components/TestConfigForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TestStatusBadge from "@/components/TestStatusBadge";
import TestRunStatus from "@/components/TestRunStatus";
import { Play, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TestSuites() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const { data: tests = [] } = useQuery<Test[]>({
    queryKey: ['/api/tests'],
  });

  const createTestMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/tests', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      setShowCreateDialog(false);
      toast({
        title: "Test created",
        description: "Your test has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const runTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      return await apiRequest('POST', `/api/tests/${testId}/run`);
    },
    onSuccess: (_, testId) => {
      toast({
        title: "Test started",
        description: "Test execution has been started.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/test-runs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tests', testId, 'runs'] });
    },
  });

  const deleteTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      return await apiRequest('DELETE', `/api/tests/${testId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      toast({
        title: "Test deleted",
        description: "The test has been deleted successfully.",
      });
    },
  });

  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Test Suites</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your automated tests</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-test">
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-tests"
          />
        </div>
        <Button variant="outline" data-testid="button-filter">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {filteredTests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? 'No tests match your search.' : 'No tests created yet. Click "Create Test" to get started.'}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Last Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id} data-testid={`row-test-${test.id}`} className="hover-elevate">
                  <TableCell className="font-medium">{test.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{test.url}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{test.browser}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {test.headless ? 'Headless' : 'Headed'}
                  </TableCell>
                  <TableCell>
                    <TestRunStatus testId={test.id} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => runTestMutation.mutate(test.id)}
                        data-testid={`button-run-${test.id}`}
                        disabled={runTestMutation.isPending}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-view-${test.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTestMutation.mutate(test.id)}
                        data-testid={`button-delete-${test.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Test</DialogTitle>
          </DialogHeader>
          <TestConfigForm
            onSave={(config) => createTestMutation.mutate(config)}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
