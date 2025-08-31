import { useState, useRef } from "react";
import { Eye, EyeOff, Key, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (credentials: { password: string; keyFile?: File }) => void;
  action: "encrypt" | "decrypt";
}

export const CredentialModal = ({ isOpen, onClose, onSubmit, action }: CredentialModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    onSubmit({ 
      password, 
      keyFile: keyFile || undefined 
    });
    
    // Reset form
    setPassword("");
    setKeyFile(null);
    setShowPassword(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKeyFile(file);
    }
  };

  const removeKeyFile = () => {
    setKeyFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-primary" />
            <span>Authentication Required</span>
          </DialogTitle>
          <DialogDescription>
            Enter your credentials to {action} the selected applications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password">Master Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password"
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Key File (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="keyfile">Key File (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {keyFile ? keyFile.name : "Select key file"}
              </Button>
              {keyFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeKeyFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".key,.pem,.p12,.pfx"
            />
            {keyFile && (
              <p className="text-xs text-muted-foreground">
                Selected: {keyFile.name} ({(keyFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!password.trim()}
              className={action === "encrypt" ? "bg-encrypted hover:bg-encrypted/90" : ""}
              variant={action === "decrypt" ? "destructive" : "default"}
            >
              {action === "encrypt" ? "Encrypt" : "Decrypt"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};