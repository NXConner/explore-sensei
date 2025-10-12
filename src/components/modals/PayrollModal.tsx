import { X, User, DollarSign, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface PayrollModalProps {
  onClose: () => void;
}

export const PayrollModal = ({ onClose }: PayrollModalProps) => {
  const employees = [
    {
      id: 1,
      name: "John Smith",
      role: "Full-time Technician",
      hours: 40,
      rate: 20,
      bonuses: 150,
      status: "Active",
    },
    {
      id: 2,
      name: "Mike Johnson",
      role: "Full-time Technician",
      hours: 42,
      rate: 20,
      bonuses: 200,
      status: "Active",
    },
    {
      id: 3,
      name: "Sarah Davis",
      role: "Part-time Technician",
      hours: 20,
      rate: 20,
      bonuses: 0,
      status: "Active",
    },
  ];

  const totalPayroll = employees.reduce((sum, emp) => sum + emp.hours * emp.rate + emp.bonuses, 0);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[80vh] tactical-panel m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">
              Payroll Management
            </h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="tactical-panel p-6">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
              <p className="text-3xl font-bold">{employees.length}</p>
            </div>

            <div className="tactical-panel p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
              <p className="text-3xl font-bold">
                {employees.reduce((sum, emp) => sum + emp.hours, 0)}
              </p>
            </div>

            <div className="tactical-panel p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Payroll</p>
              <p className="text-3xl font-bold text-green-500">${totalPayroll.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {employees.map((employee) => (
              <div key={employee.id} className="tactical-panel p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                  <Badge>{employee.status}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Hours Worked</p>
                    <p className="text-xl font-bold">{employee.hours}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                    <p className="text-xl font-bold">${employee.rate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Base Pay</p>
                    <p className="text-xl font-bold text-primary">
                      ${(employee.hours * employee.rate).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bonuses</p>
                    <p className="text-xl font-bold text-green-500">${employee.bonuses}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-sm">Total Compensation</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    ${(employee.hours * employee.rate + employee.bonuses).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="tactical-panel p-6">
            <h3 className="font-bold text-lg mb-4 text-primary">Bonus Structure</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-primary/20">
                <span className="text-sm">"Beat the Clock" Efficiency Bonus</span>
                <span className="text-sm text-primary">50% of hours saved</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-primary/20">
                <span className="text-sm">"Do It Right" Quality Bonus</span>
                <span className="text-sm text-primary">$50 per completed job</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">"Company Win" Profit Bonus</span>
                <span className="text-sm text-primary">10% of extra profit</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
