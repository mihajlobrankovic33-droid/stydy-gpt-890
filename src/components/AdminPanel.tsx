import { useState, useEffect } from "react";
import { X, Shield, RotateCcw, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DEVICE_REGISTRY, 
  getDeviceCount, 
  clearAllDevices,
  type DeviceEntry 
} from "@/lib/deviceRegistry";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Create a mutable copy of registry for status toggling (in-memory only)
let registryState = DEVICE_REGISTRY.map(entry => ({ ...entry }));

export const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
  const [registry, setRegistry] = useState<DeviceEntry[]>(registryState);
  const [deviceCounts, setDeviceCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      updateDeviceCounts();
    }
  }, [isOpen]);

  const updateDeviceCounts = () => {
    const counts: Record<string, number> = {};
    registry.forEach(entry => {
      counts[entry.key] = getDeviceCount(entry.key);
    });
    setDeviceCounts(counts);
  };

  const toggleStatus = (key: string) => {
    registryState = registryState.map(entry => 
      entry.key === key 
        ? { ...entry, status: entry.status === 'active' ? 'expired' : 'active' } 
        : entry
    );
    setRegistry([...registryState]);
    
    // Update the original registry in memory
    const idx = DEVICE_REGISTRY.findIndex(e => e.key === key);
    if (idx >= 0) {
      DEVICE_REGISTRY[idx].status = registryState[idx].status;
    }
  };

  const resetDevicesForKey = (key: string) => {
    clearAllDevices(key);
    updateDeviceCounts();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-200">Admin Panel</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Ime</TableHead>
                  <TableHead className="text-slate-400">Study Buddy</TableHead>
                  <TableHead className="text-slate-400">Ključ</TableHead>
                  <TableHead className="text-slate-400 text-center">Uređaji</TableHead>
                  <TableHead className="text-slate-400 text-center">Status</TableHead>
                  <TableHead className="text-slate-400 text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registry.map((entry) => (
                  <TableRow key={entry.key} className="border-slate-800 hover:bg-slate-900/50">
                    <TableCell className="text-slate-300 font-medium">
                      {entry.name}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {getAvatarDisplayName(entry.avatar)}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                        {entry.key}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-slate-700 text-slate-400">
                        {deviceCounts[entry.key] || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={entry.status === 'active' ? 'default' : 'destructive'}
                        className={entry.status === 'active' 
                          ? 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' 
                          : 'bg-red-600/20 text-red-400 border-red-600/30'
                        }
                      >
                        {entry.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(entry.key)}
                          className={`text-xs ${
                            entry.status === 'active'
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-950/50'
                              : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50'
                          }`}
                        >
                          <Power className="w-3 h-3 mr-1" />
                          {entry.status === 'active' ? 'Deaktiviraj' : 'Aktiviraj'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetDevicesForKey(entry.key)}
                          className="text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-950/50"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-600">
            Pritisni ESC ili Ctrl+Shift+A za zatvaranje
          </p>
        </div>
      </div>
    </div>
  );
};

function getAvatarDisplayName(avatar: string): string {
  const names: Record<string, string> = {
    rabbit: '🐰 Bunny Scholar',
    owl: '🦉 Wise Owl',
    fox: '🦊 Clever Fox',
    panda: '🐼 Zen Panda',
    cat: '🐱 Curious Cat',
    penguin: '🐧 Cool Penguin',
  };
  return names[avatar] || avatar;
}
