import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AiTestGeneratorProps {
  targetUrl: string;
  onGenerate: (script: string) => void;
}

export default function AiTestGenerator({ targetUrl, onGenerate }: AiTestGeneratorProps) {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe what you want to test",
        variant: "destructive",
      });
      return;
    }

    if (!targetUrl.trim()) {
      toast({
        title: "Target URL required",
        description: "Please set a target URL first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          targetUrl: targetUrl.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate test');
      }

      const data = await response.json();
      onGenerate(data.script);
      setDescription("");
      
      toast({
        title: "Test generated!",
        description: "Your test script has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate test script",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card data-testid="card-ai-generator">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI-Powered Test Generator
        </CardTitle>
        <CardDescription>
          Describe what you want to test in plain English, and AI will generate the test script for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-description">What do you want to test?</Label>
          <Textarea
            id="ai-description"
            placeholder="Example: Click the login button, enter username 'admin' and password 'test123', submit the form, and verify the dashboard page loads"
            className="min-h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isGenerating}
            data-testid="textarea-ai-description"
          />
        </div>
        
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim() || !targetUrl.trim()}
          className="w-full"
          data-testid="button-generate-ai-test"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Test Script
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
