import React, { useState } from "react";
import { Plus, Trash2, Power, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAutomation } from "@/hooks/useAutomation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const AutomationBuilder = () => {
  const { rules, createRule, deleteRule, toggleRule } = useAutomation();
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    trigger_type: "job_created",
    trigger_config: {},
    action_type: "send_notification",
    action_config: {},
  });

  const handleCreateRule = () => {
    if (!newRule.name) return;
    createRule(newRule);
    setNewRule({
      name: "",
      description: "",
      trigger_type: "job_created",
      trigger_config: {},
      action_type: "send_notification",
      action_config: {},
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Automation Rules</h3>
          <p className="text-muted-foreground">
            Automate workflows and save time with smart automation
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Rule Name</Label>
                <Input
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., Auto-assign new jobs"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Describe what this automation does..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trigger</Label>
                  <Select
                    value={newRule.trigger_type}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, trigger_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job_created">Job Created</SelectItem>
                      <SelectItem value="job_completed">Job Completed</SelectItem>
                      <SelectItem value="time_schedule">Time Schedule</SelectItem>
                      <SelectItem value="threshold_reached">Threshold Reached</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select
                    value={newRule.action_type}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, action_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_notification">Send Notification</SelectItem>
                      <SelectItem value="assign_crew">Assign Crew</SelectItem>
                      <SelectItem value="send_email">Send Email</SelectItem>
                      <SelectItem value="webhook">Trigger Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateRule} className="w-full">
                Create Automation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {!rules || rules.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No automation rules yet. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle>{rule.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.active}
                      onCheckedChange={(checked) =>
                        toggleRule({ id: rule.id, active: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {rule.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Trigger:</span>{" "}
                    <span className="font-medium">{rule.trigger_type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Action:</span>{" "}
                    <span className="font-medium">{rule.action_type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <span
                      className={`font-medium ${
                        rule.active ? "text-green-500" : "text-muted-foreground"
                      }`}
                    >
                      {rule.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
