import { useState } from "react";
import { Shield, Lock, Unlock, Settings, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CredentialModal } from "./CredentialModal";
import { ThemeToggle } from "./ThemeToggle";
import { useToast } from "@/hooks/use-toast";

export type AppStatus = "encrypted" | "decrypted" | "processing";

export interface Application {
  id: string;
  name: string;
  version: string;
  status: AppStatus;
  lastAction: string;
  size: string;
}

const mockApplications: Application[] = [
  { id: "1", name: "Microsoft Office", version: "365", status: "encrypted", lastAction: "2024-01-15", size: "2.1 GB" },
  { id: "2", name: "Adobe Photoshop", version: "2024", status: "decrypted", lastAction: "2024-01-14", size: "3.5 GB" },
  { id: "3", name: "Google Chrome", version: "120.0", status: "encrypted", lastAction: "2024-01-13", size: "245 MB" },
  { id: "4", name: "Visual Studio Code", version: "1.85", status: "decrypted", lastAction: "2024-01-12", size: "532 MB" },
  { id: "5", name: "Slack", version: "4.35", status: "processing", lastAction: "2024-01-11", size: "180 MB" },
  { id: "6", name: "Zoom", version: "5.16", status: "encrypted", lastAction: "2024-01-10", size: "156 MB" },
];

export const SecurityDashboard = () => {
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<"encrypt" | "decrypt">("encrypt");
  const { toast } = useToast();

  const handleSelectApp = (appId: string) => {
    setSelectedApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApps.length === applications.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(applications.map(app => app.id));
    }
  };

  const handleAction = (action: "encrypt" | "decrypt") => {
    if (selectedApps.length === 0) {
      toast({
        title: "No applications selected",
        description: "Please select one or more applications to perform the action.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentAction(action);
    setShowCredentialModal(true);
  };

  const handleCredentialSubmit = (credentials: { password: string; keyFile?: File }) => {
    setShowCredentialModal(false);
    
    // Simulate processing
    setApplications(prev => 
      prev.map(app => 
        selectedApps.includes(app.id) 
          ? { ...app, status: "processing" as AppStatus }
          : app
      )
    );

    // Simulate completion after 2 seconds
    setTimeout(() => {
      setApplications(prev => 
        prev.map(app => 
          selectedApps.includes(app.id)
            ? { 
                ...app, 
                status: currentAction === "encrypt" ? "encrypted" : "decrypted",
                lastAction: new Date().toISOString().split('T')[0]
              }
            : app
        )
      );
      
      setSelectedApps([]);
      
      toast({
        title: `${currentAction === "encrypt" ? "Encryption" : "Decryption"} completed`,
        description: `Successfully ${currentAction === "encrypt" ? "encrypted" : "decrypted"} ${selectedApps.length} application(s).`,
      });
    }, 2000);
  };

  const getStatusBadge = (status: AppStatus) => {
    switch (status) {
      case "encrypted":
        return (
          <Badge className="bg-encrypted text-encrypted-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Encrypted
          </Badge>
        );
      case "decrypted":
        return (
          <Badge className="bg-decrypted text-decrypted-foreground">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Decrypted
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-processing text-processing-foreground animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
    }
  };

  const getStatusCounts = () => {
    const counts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<AppStatus, number>);
    
    return {
      encrypted: counts.encrypted || 0,
      decrypted: counts.decrypted || 0,
      processing: counts.processing || 0,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">SecureApp Manager</h1>
              <p className="text-muted-foreground">Application Encryption & Security Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encrypted Apps</CardTitle>
              <Lock className="h-4 w-4 text-encrypted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-encrypted">{statusCounts.encrypted}</div>
              <p className="text-xs text-muted-foreground">Applications secured</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unprotected Apps</CardTitle>
              <Unlock className="h-4 w-4 text-decrypted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-decrypted">{statusCounts.decrypted}</div>
              <p className="text-xs text-muted-foreground">Applications at risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-processing" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-processing">{statusCounts.processing}</div>
              <p className="text-xs text-muted-foreground">Operations in progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => handleAction("encrypt")}
              disabled={selectedApps.length === 0}
              className="bg-encrypted hover:bg-encrypted/90"
            >
              <Lock className="w-4 h-4 mr-2" />
              Encrypt Selected ({selectedApps.length})
            </Button>
            <Button 
              onClick={() => handleAction("decrypt")}
              disabled={selectedApps.length === 0}
              variant="destructive"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Decrypt Selected ({selectedApps.length})
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedApps.length} of {applications.length} applications selected
          </p>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Installed Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedApps.length === applications.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedApps.includes(app.id)}
                        onCheckedChange={() => handleSelectApp(app.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell>{app.version}</TableCell>
                    <TableCell>{app.size}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{app.lastAction}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Credential Modal */}
        <CredentialModal
          isOpen={showCredentialModal}
          onClose={() => setShowCredentialModal(false)}
          onSubmit={handleCredentialSubmit}
          action={currentAction}
        />
      </div>
    </div>
  );
};