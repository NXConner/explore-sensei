import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Shield, TrendingDown, User, Calendar, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmployeeComplianceModalProps {
  onClose: () => void;
}

interface Violation {
  id: string;
  employee_id: string;
  rule_id: string;
  violation_date: string;
  description: string;
  points_deducted: number;
  reported_by: string;
  employees?: { first_name: string; last_name: string };
  compliance_rules?: { name: string; severity: string; category: string };
}

interface DisciplinaryAction {
  id: string;
  employee_id: string;
  violation_id: string;
  action_type: string;
  description: string;
  effective_date: string;
  duration_days: number | null;
  auto_generated: boolean;
  employees?: { first_name: string; last_name: string };
}

interface ComplianceScore {
  employee_id: string;
  score: number;
  period_start: string;
  period_end: string;
  employees?: { first_name: string; last_name: string };
}

export const EmployeeComplianceModal = ({ onClose }: EmployeeComplianceModalProps) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [actions, setActions] = useState<DisciplinaryAction[]>([]);
  const [scores, setScores] = useState<ComplianceScore[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [overrideDialog, setOverrideDialog] = useState<{ open: boolean; actionId: string | null }>({
    open: false,
    actionId: null,
  });
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideAction, setOverrideAction] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    fetchData();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["Super Administrator", "Administrator"])
      .single();

    setIsAdmin(!!data);
  };

  const fetchData = async () => {
    // Fetch violations
    const { data: violationsData, error: violationsError } = await (supabase as any)
      .from("employee_violations")
      .select(`
        *,
        employees:employee_id (first_name, last_name),
        compliance_rules:rule_id (name, severity, category)
      `)
      .order("violation_date", { ascending: false });

    if (violationsError) {
      toast({
        title: "Error",
        description: "Failed to load violations",
        variant: "destructive",
      });
    } else {
      setViolations(violationsData || []);
    }

    // Fetch disciplinary actions
    const { data: actionsData, error: actionsError } = await (supabase as any)
      .from("disciplinary_actions")
      .select(`
        *,
        employees:employee_id (first_name, last_name)
      `)
      .order("created_at", { ascending: false });

    if (actionsError) {
      toast({
        title: "Error",
        description: "Failed to load disciplinary actions",
        variant: "destructive",
      });
    } else {
      setActions(actionsData || []);
    }

    // Fetch compliance scores
    const { data: scoresData, error: scoresError } = await (supabase as any)
      .from("employee_compliance_scores")
      .select(`
        *,
        employees:employee_id (first_name, last_name)
      `)
      .order("period_end", { ascending: false });

    if (!scoresError) {
      setScores(scoresData || []);
    }
  };

  const handleOverride = async () => {
    if (!overrideDialog.actionId || !overrideReason || !overrideAction) {
      toast({
        title: "Error",
        description: "Please provide reason and action",
        variant: "destructive",
      });
      return;
    }

    const { error } = await (supabase as any)
      .from("disciplinary_actions")
      .update({
        action_type: overrideAction,
        description: `ADMIN OVERRIDE: ${overrideReason}`,
        auto_generated: false,
      })
      .eq("id", overrideDialog.actionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to override action",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Disciplinary action overridden",
      });
      setOverrideDialog({ open: false, actionId: null });
      setOverrideReason("");
      setOverrideAction("");
      fetchData();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "major": return "bg-orange-500/20 text-orange-400";
      case "moderate": return "bg-yellow-500/20 text-yellow-400";
      case "minor": return "bg-blue-500/20 text-blue-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType?.toLowerCase()) {
      case "suspension": return "bg-red-500/20 text-red-400";
      case "written_warning": return "bg-yellow-500/20 text-yellow-400";
      case "warning": return "bg-blue-500/20 text-blue-400";
      case "counseling": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-7xl h-[90vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Employee Compliance & Discipline
          </h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <Tabs defaultValue="violations" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="violations">Violations</TabsTrigger>
              <TabsTrigger value="actions">Disciplinary Actions</TabsTrigger>
              <TabsTrigger value="scores">Compliance Scores</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="violations" className="space-y-4 mt-6">
              {violations.map((violation) => (
                <Card key={violation.id} className="hud-element border-primary/30 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertTriangle className="w-5 h-5 text-primary mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">
                            {violation.compliance_rules?.name || "Unknown Rule"}
                          </h3>
                          <Badge className={getSeverityColor(violation.compliance_rules?.severity || "")}>
                            {violation.compliance_rules?.severity?.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-primary">
                            -{violation.points_deducted} points
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{violation.description}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <p>
                            <User className="w-3 h-3 inline mr-1" />
                            <span className="font-medium">Employee:</span>{" "}
                            {violation.employees?.first_name} {violation.employees?.last_name}
                          </p>
                          <p>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            <span className="font-medium">Date:</span>{" "}
                            {format(new Date(violation.violation_date), "MMM dd, yyyy")}
                          </p>
                          <p>
                            <FileWarning className="w-3 h-3 inline mr-1" />
                            <span className="font-medium">Category:</span>{" "}
                            {violation.compliance_rules?.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {violations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No violations recorded</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4 mt-6">
              {actions.map((action) => (
                <Card key={action.id} className="hud-element border-primary/30 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <TrendingDown className="w-5 h-5 text-primary mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold capitalize">
                            {action.action_type.replace("_", " ")}
                          </h3>
                          <Badge className={getActionColor(action.action_type)}>
                            {action.action_type.replace("_", " ").toUpperCase()}
                          </Badge>
                          {action.auto_generated && (
                            <Badge variant="outline" className="text-blue-400">
                              AUTO-GENERATED
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <p>
                            <User className="w-3 h-3 inline mr-1" />
                            <span className="font-medium">Employee:</span>{" "}
                            {action.employees?.first_name} {action.employees?.last_name}
                          </p>
                          <p>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            <span className="font-medium">Effective:</span>{" "}
                            {format(new Date(action.effective_date), "MMM dd, yyyy")}
                          </p>
                          {action.duration_days && (
                            <p>
                              <span className="font-medium">Duration:</span> {action.duration_days} days
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {isAdmin && action.auto_generated && (
                      <Button
                        onClick={() => setOverrideDialog({ open: true, actionId: action.id })}
                        variant="outline"
                        size="sm"
                        className="border-primary/30"
                      >
                        Override
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
              {actions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No disciplinary actions recorded</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="scores" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scores.map((score) => (
                  <Card key={`${score.employee_id}-${score.period_end}`} className="hud-element border-primary/30 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <h3 className="font-bold">
                          {score.employees?.first_name} {score.employees?.last_name}
                        </h3>
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(score.score)}`}>
                        {score.score}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(score.period_start), "MMM dd")} -{" "}
                      {format(new Date(score.period_end), "MMM dd, yyyy")}
                    </p>
                  </Card>
                ))}
              </div>
              {scores.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No compliance scores available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="hud-element border-primary/30 p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Violations</h3>
                  <p className="text-3xl font-bold text-red-400 mt-2">{violations.length}</p>
                </Card>
                <Card className="hud-element border-primary/30 p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Active Actions</h3>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{actions.length}</p>
                </Card>
                <Card className="hud-element border-primary/30 p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Auto-Generated</h3>
                  <p className="text-3xl font-bold text-blue-400 mt-2">
                    {actions.filter(a => a.auto_generated).length}
                  </p>
                </Card>
                <Card className="hud-element border-primary/30 p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Avg Compliance</h3>
                  <p className={`text-3xl font-bold mt-2 ${getScoreColor(
                    scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0
                  )}`}>
                    {scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0}
                  </p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>

      {/* Admin Override Dialog */}
      <Dialog open={overrideDialog.open} onOpenChange={(open) => setOverrideDialog({ open, actionId: null })}>
        <DialogContent className="hud-element border-primary/30">
          <DialogHeader>
            <DialogTitle>Override Disciplinary Action</DialogTitle>
            <DialogDescription>
              Provide a reason and new action type to override the auto-generated disciplinary action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">New Action Type</label>
              <Select value={overrideAction} onValueChange={setOverrideAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="written_warning">Written Warning</SelectItem>
                  <SelectItem value="counseling">Counseling</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Override Reason</label>
              <Textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why you're overriding this action..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOverrideDialog({ open: false, actionId: null });
                setOverrideReason("");
                setOverrideAction("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleOverride}>Override Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
