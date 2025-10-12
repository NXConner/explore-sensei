import { X, Users, Plus, Search, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClientsModalProps {
  onClose: () => void;
}

export const ClientsModal = ({ onClose }: ClientsModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredClients = clients?.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddClient = () => {
    toast({
      title: "Add Client",
      description: "Client creation form coming soon!",
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[80vh] tactical-panel m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">
              Client Management
            </h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 border-b border-primary/30 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAddClient}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients?.map((client) => (
              <div key={client.id} className="tactical-panel p-4">
                <h3 className="font-bold text-lg mb-2">{client.name || "Unnamed Client"}</h3>

                <div className="space-y-2">
                  {client.contact && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{client.contact}</span>
                    </div>
                  )}

                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    Added: {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {filteredClients?.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No clients found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
