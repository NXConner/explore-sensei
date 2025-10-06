import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";

interface ReportData {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  activeEmployees: number;
  avgJobDuration: number;
}

export const ReportsDashboard = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    activeEmployees: 0,
    avgJobDuration: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    // Fetch jobs data
    const { data: jobs } = await supabase.from("jobs").select("status");

    // Fetch employees data
    const { data: employees } = await supabase
      .from("employees")
      .select("status")
      .eq("status", "Active");

    if (jobs) {
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter((j) => j.status === "In Progress").length;
      const completedJobs = jobs.filter((j) => j.status === "Completed").length;

      setReportData({
        totalJobs,
        activeJobs,
        completedJobs,
        totalRevenue: 847000, // Mock data
        activeEmployees: employees?.length || 0,
        avgJobDuration: 14, // Mock data
      });
    }
  };

  const metrics = [
    {
      title: "Total Jobs",
      value: reportData.totalJobs,
      icon: BarChart3,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Active Jobs",
      value: reportData.activeJobs,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Total Revenue",
      value: `$${reportData.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      title: "Active Employees",
      value: reportData.activeEmployees,
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Completed Jobs",
      value: reportData.completedJobs,
      icon: BarChart3,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
    },
    {
      title: "Avg Job Duration",
      value: `${reportData.avgJobDuration} days`,
      icon: Calendar,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-glow">Reports & Analytics</h2>
        <Badge className="bg-primary/20 text-primary">Live Data</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="hud-element border-primary/30 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-glow">{metric.value}</p>
              </div>
              <div className={`${metric.bgColor} p-3 rounded-lg`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="hud-element border-primary/30 p-6">
        <h3 className="text-xl font-bold text-glow mb-4">Performance Overview</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Job Completion Rate</span>
            <span className="font-bold text-green-400">
              {reportData.totalJobs > 0
                ? Math.round((reportData.completedJobs / reportData.totalJobs) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${
                  reportData.totalJobs > 0
                    ? (reportData.completedJobs / reportData.totalJobs) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-muted-foreground">Revenue per Job</span>
            <span className="font-bold text-yellow-400">
              $
              {reportData.totalJobs > 0
                ? Math.round(reportData.totalRevenue / reportData.totalJobs).toLocaleString()
                : 0}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
