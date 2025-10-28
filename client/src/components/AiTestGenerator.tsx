import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, Loader2, HelpCircle, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AI_DESCRIPTION_STORAGE_KEY = "ai-test-description";

interface AiTestGeneratorProps {
  targetUrl: string;
  onGenerate: (script: string) => void;
}

export default function AiTestGenerator({ targetUrl, onGenerate }: AiTestGeneratorProps) {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { toast } = useToast();

  // Load description from localStorage on mount
  useEffect(() => {
    const savedDescription = localStorage.getItem(AI_DESCRIPTION_STORAGE_KEY);
    if (savedDescription) {
      setDescription(savedDescription);
    }
  }, []);

  // Save description to localStorage whenever it changes
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    localStorage.setItem(AI_DESCRIPTION_STORAGE_KEY, value);
  };

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
        <Collapsible open={showGuide} onOpenChange={setShowGuide}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between mb-4"
              data-testid="button-toggle-guide"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                How to Use AI Test Generator
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mb-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">What is AI Test Generator?</h4>
                    <p className="text-sm text-muted-foreground">
                      The AI Test Generator converts plain English descriptions into automated browser test scripts. Just describe what you want to test in natural language, and AI will create the test commands for you.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">How to Write Good Descriptions</h4>
                    <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                      <li>Be specific about actions: "click", "type", "select", "verify"</li>
                      <li>Include exact text for buttons and fields</li>
                      <li>Mention expected outcomes</li>
                      <li>Describe steps in order</li>
                      <li>Use quotes for text values</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Good Examples
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-muted p-3 rounded">
                        <p className="font-medium text-green-600">Login Flow</p>
                        <p className="text-muted-foreground mt-1">
                          "Enter email 'user@example.com', click Continue, enter password 'test123', click Continue to log in"
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="font-medium text-green-600">Form Submission</p>
                        <p className="text-muted-foreground mt-1">
                          "Fill ticker field with NVDA, select Stock from equity type dropdown, enter quantity 10, click Create Automation"
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="font-medium text-green-600">Navigation</p>
                        <p className="text-muted-foreground mt-1">
                          "Click Admin, wait, click Data Sources, wait, click System Settings"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Avoid These
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-muted p-3 rounded">
                        <p className="font-medium text-red-600">Too vague</p>
                        <p className="text-muted-foreground mt-1">
                          "Test the login" - Missing specific steps and values
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="font-medium text-red-600">No details</p>
                        <p className="text-muted-foreground mt-1">
                          "Click some buttons" - Not specific about which buttons
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Tips for Best Results</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>Start with navigation if needed: "Go to login page"</li>
                      <li>Use exact button text: "Continue" instead of "next button"</li>
                      <li>For inputs, mention the field type or placeholder</li>
                      <li>Include wait steps for page loads: "wait for page to load"</li>
                      <li>End with verification: "verify dashboard appears"</li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-2">
          <Label htmlFor="ai-description">What do you want to test?</Label>
          <Textarea
            id="ai-description"
            placeholder="Example: Click the login button, enter username 'admin' and password 'test123', submit the form, and verify the dashboard page loads"
            className="min-h-32"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
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
