import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export interface ScriptStep {
  id: string;
  action: "goto" | "click" | "type" | "wait" | "expect" | "select";
  selector?: string;
  value?: string;
  waitTime?: number;
}

interface ScriptBuilderProps {
  value: string;
  onChange: (script: string) => void;
}

function parseScriptToSteps(script: string): ScriptStep[] {
  if (!script.trim()) return [];
  
  const lines = script.split('\n').filter(line => line.trim());
  const parsedSteps: ScriptStep[] = lines.map((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('goto ')) {
      return {
        id: `step-${index}-${Date.now()}`,
        action: 'goto',
        value: trimmed.replace('goto ', ''),
      };
    } else if (trimmed.startsWith('click ')) {
      return {
        id: `step-${index}-${Date.now()}`,
        action: 'click',
        selector: trimmed.replace('click ', ''),
      };
    } else if (trimmed.startsWith('type ')) {
      const match = trimmed.match(/type ([^\s]+) "(.+)"/);
      return {
        id: `step-${index}-${Date.now()}`,
        action: 'type',
        selector: match?.[1] || '',
        value: match?.[2] || '',
      };
    } else if (trimmed.startsWith('wait ')) {
      return {
        id: `step-${index}-${Date.now()}`,
        action: 'wait',
        waitTime: parseInt(trimmed.replace('wait ', '')) || 1000,
      };
    } else if (trimmed.startsWith('expect ')) {
      return {
        id: `step-${index}-${Date.now()}`,
        action: 'expect',
        selector: trimmed.replace('expect ', ''),
      };
    } else if (trimmed.startsWith('select ')) {
      const match = trimmed.match(/select ([^\s]+) "(.+)"/);
      return {
        id: `step-${index}-${Date.now()}`,
        action: 'select',
        selector: match?.[1] || '',
        value: match?.[2] || '',
      };
    }
    
    return {
      id: `step-${index}-${Date.now()}`,
      action: 'goto',
      value: '',
    };
  });
  
  return parsedSteps;
}

function stepsToScript(steps: ScriptStep[]): string {
  return steps.map(step => {
    switch (step.action) {
      case 'goto':
        return `goto ${step.value || ''}`;
      case 'click':
        return `click ${step.selector || ''}`;
      case 'type':
        return `type ${step.selector || ''} "${step.value || ''}"`;
      case 'select':
        return `select ${step.selector || ''} "${step.value || ''}"`;
      case 'wait':
        return `wait ${step.waitTime || 1000}`;
      case 'expect':
        return `expect ${step.selector || ''}`;
      default:
        return '';
    }
  }).filter(line => line.trim()).join('\n');
}

export default function ScriptBuilder({ value, onChange }: ScriptBuilderProps) {
  const [steps, setSteps] = useState<ScriptStep[]>(() => parseScriptToSteps(value));
  const lastExternalValue = useRef(value);
  const isInternalUpdate = useRef(false);

  // Parse value into steps when it changes externally
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    
    if (value !== lastExternalValue.current) {
      lastExternalValue.current = value;
      setSteps(parseScriptToSteps(value));
    }
  }, [value]);

  // Convert steps to script string and notify parent
  useEffect(() => {
    const script = stepsToScript(steps);
    
    if (script !== lastExternalValue.current) {
      isInternalUpdate.current = true;
      lastExternalValue.current = script;
      onChange(script);
    }
  }, [steps, onChange]);

  const addStep = () => {
    const newStep: ScriptStep = {
      id: `step-${Date.now()}`,
      action: 'goto',
      value: '',
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const updateStep = (id: string, updates: Partial<ScriptStep>) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    setSteps(newSteps);
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    setSteps(newSteps);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Test Steps</Label>
        <Button
          type="button"
          onClick={addStep}
          size="sm"
          data-testid="button-add-step"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      {steps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No steps added yet</p>
            <Button
              type="button"
              onClick={addStep}
              variant="outline"
              data-testid="button-add-first-step"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Step
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <Card key={step.id} data-testid={`card-step-${index}`}>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveStepUp(index)}
                      disabled={index === 0}
                      data-testid={`button-move-up-${index}`}
                      className="h-8 w-8"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveStepDown(index)}
                      disabled={index === steps.length - 1}
                      data-testid={`button-move-down-${index}`}
                      className="h-8 w-8"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label className="text-sm mb-2 block">Action</Label>
                        <Select
                          value={step.action}
                          onValueChange={(value: any) =>
                            updateStep(step.id, { action: value })
                          }
                        >
                          <SelectTrigger data-testid={`select-action-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="goto">Navigate to URL</SelectItem>
                            <SelectItem value="click">Click Element</SelectItem>
                            <SelectItem value="type">Type Text</SelectItem>
                            <SelectItem value="select">Select Dropdown</SelectItem>
                            <SelectItem value="wait">Wait</SelectItem>
                            <SelectItem value="expect">Expect Element</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(step.id)}
                          data-testid={`button-remove-${index}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {step.action === 'goto' && (
                      <div>
                        <Label className="text-sm mb-2 block">URL</Label>
                        <Input
                          value={step.value || ''}
                          onChange={(e) =>
                            updateStep(step.id, { value: e.target.value })
                          }
                          placeholder="https://example.com"
                          data-testid={`input-url-${index}`}
                        />
                      </div>
                    )}

                    {(step.action === 'click' || step.action === 'expect') && (
                      <div>
                        <Label className="text-sm mb-2 block">Selector</Label>
                        <Input
                          value={step.selector || ''}
                          onChange={(e) =>
                            updateStep(step.id, { selector: e.target.value })
                          }
                          placeholder="button, #submit, [data-testid='login']"
                          data-testid={`input-selector-${index}`}
                        />
                      </div>
                    )}

                    {step.action === 'type' && (
                      <>
                        <div>
                          <Label className="text-sm mb-2 block">Selector</Label>
                          <Input
                            value={step.selector || ''}
                            onChange={(e) =>
                              updateStep(step.id, { selector: e.target.value })
                            }
                            placeholder="input[name='email'], #username"
                            data-testid={`input-selector-${index}`}
                          />
                        </div>
                        <div>
                          <Label className="text-sm mb-2 block">Text to Type</Label>
                          <Input
                            value={step.value || ''}
                            onChange={(e) =>
                              updateStep(step.id, { value: e.target.value })
                            }
                            placeholder="Text to enter"
                            data-testid={`input-text-${index}`}
                          />
                        </div>
                      </>
                    )}

                    {step.action === 'select' && (
                      <>
                        <div>
                          <Label className="text-sm mb-2 block">Selector</Label>
                          <Input
                            value={step.selector || ''}
                            onChange={(e) =>
                              updateStep(step.id, { selector: e.target.value })
                            }
                            placeholder="select[name='country'], #dropdown"
                            data-testid={`input-selector-${index}`}
                          />
                        </div>
                        <div>
                          <Label className="text-sm mb-2 block">Option to Select</Label>
                          <Input
                            value={step.value || ''}
                            onChange={(e) =>
                              updateStep(step.id, { value: e.target.value })
                            }
                            placeholder="Option text or value (e.g., 'United States' or 'US')"
                            data-testid={`input-option-${index}`}
                          />
                        </div>
                      </>
                    )}

                    {step.action === 'wait' && (
                      <div>
                        <Label className="text-sm mb-2 block">Wait Time (milliseconds)</Label>
                        <Input
                          type="number"
                          value={step.waitTime || 1000}
                          onChange={(e) =>
                            updateStep(step.id, { waitTime: parseInt(e.target.value) || 1000 })
                          }
                          placeholder="1000"
                          data-testid={`input-wait-time-${index}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
