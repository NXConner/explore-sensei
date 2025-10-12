import React from "react";
import { User, Mail, Phone, MapPin, Building, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Profile = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="tactical-panel p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <User className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-glow text-primary mb-2">OPERATOR PROFILE</h1>
              <p className="text-muted-foreground mb-4">Admin Account</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm">
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="tactical-panel p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-bold">Admin User</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-bold">System Administrator</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-bold">AOS-001</p>
              </div>
            </div>
          </Card>

          <Card className="tactical-panel p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p>admin@asphaltos.com</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p>Stuart, VA 24171</p>
              </div>
            </div>
          </Card>

          <Card className="tactical-panel p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Business</p>
                <p className="font-bold">CONNER Asphalt Services</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-bold">337 Ayers Orchard Road</p>
                <p className="font-bold">Stuart, VA 24171</p>
              </div>
            </div>
          </Card>

          <Card className="tactical-panel p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Achievements
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p>Projects Completed</p>
                <p className="font-bold text-primary">127</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Team Members</p>
                <p className="font-bold text-primary">3</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Active Jobs</p>
                <p className="font-bold text-primary">8</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
