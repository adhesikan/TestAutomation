import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, BookMarked, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { UserDataset } from "@shared/schema";

export default function DatasetManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDatasetDescription, setNewDatasetDescription] = useState("");
  const [newDatasetSteps, setNewDatasetSteps] = useState("");

  const { data: datasets = [], isLoading } = useQuery<UserDataset[]>({
    queryKey: ['/api/datasets'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/datasets/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/datasets'] });
      toast({
        title: "Dataset Deleted",
        description: "Training example has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { description: string; steps: string[]; variables?: Record<string, string> }) => 
      apiRequest('/api/datasets', 'POST', { ...data, source: 'manual' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/datasets'] });
      toast({
        title: "Dataset Created",
        description: "New training example has been added successfully.",
      });
      setIsAddDialogOpen(false);
      setNewDatasetDescription("");
      setNewDatasetSteps("");
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateDataset = () => {
    if (!newDatasetDescription.trim() || !newDatasetSteps.trim()) {
      toast({
        title: "Validation Error",
        description: "Both description and test steps are required.",
        variant: "destructive",
      });
      return;
    }

    const steps = newDatasetSteps.split('\n').filter(line => line.trim());
    createMutation.mutate({
      description: newDatasetDescription,
      steps,
      variables: {},
    });
  };

  const learningDatasets = datasets.filter(d => d.source === 'learning');
  const manualDatasets = datasets.filter(d => d.source === 'manual');

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Training Dataset</h1>
            <p className="text-muted-foreground">
              Manage training examples that improve AI test generation
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-dataset">
                <Plus className="h-4 w-4 mr-2" />
                Add Training Example
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Training Example</DialogTitle>
                <DialogDescription>
                  Create a new training example to improve AI test generation. Provide a description and the test script steps.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Login to AlgoPilotX and select a strategy"
                    value={newDatasetDescription}
                    onChange={(e) => setNewDatasetDescription(e.target.value)}
                    data-testid="input-dataset-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="steps">Test Script (one command per line)</Label>
                  <Textarea
                    id="steps"
                    placeholder={`goto https://app.algopilotx.com\nexpect input[type="email"]\ntype input[type="email"] "user@example.com"\nwait 500\nclick button:has-text("Continue")`}
                    value={newDatasetSteps}
                    onChange={(e) => setNewDatasetSteps(e.target.value)}
                    className="font-mono text-sm h-[300px]"
                    data-testid="textarea-dataset-steps"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel-dataset"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateDataset}
                    disabled={createMutation.isPending}
                    data-testid="button-save-dataset"
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save Training Example'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {/* Learning Mode Datasets */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookMarked className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Learning Mode Examples</h2>
              <Badge variant="secondary">{learningDatasets.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Training examples automatically saved from successful test runs
            </p>
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading datasets...
                </CardContent>
              </Card>
            ) : learningDatasets.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No learning examples yet. Run tests successfully and save them as training examples to start building your dataset.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {learningDatasets.map((dataset) => (
                  <Card key={dataset.id} data-testid={`card-dataset-${dataset.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{dataset.description}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(dataset.createdAt), 'PPp')}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(dataset.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${dataset.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[150px] w-full rounded-md border bg-muted/50">
                        <pre className="p-4 text-xs font-mono">
                          {dataset.steps.join('\n')}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Manual Datasets */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plus className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Manual Examples</h2>
              <Badge variant="secondary">{manualDatasets.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Training examples manually contributed by you
            </p>
            {manualDatasets.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No manual examples yet. Click "Add Training Example" to create your first one.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {manualDatasets.map((dataset) => (
                  <Card key={dataset.id} data-testid={`card-dataset-${dataset.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{dataset.description}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(dataset.createdAt), 'PPp')}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(dataset.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${dataset.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[150px] w-full rounded-md border bg-muted/50">
                        <pre className="p-4 text-xs font-mono">
                          {dataset.steps.join('\n')}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
