import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProUpgradeModal } from "./ProUpgradeModal";
import {
  canCreatePuskica,
  getRemainingToday,
  getAllPuskice,
  createPuskica,
  deletePuskica,
  updatePuskica,
  PuskiceItem,
} from "@/lib/puskiceService";
import { Plus, Eye, Trash2, FileText, Sparkles, Shield, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";

export function PuskiceSection() {
  const { isPro, isLifetimePro } = useSupabaseAuth();
  // Pro users have unlimited access
  const hasUnlimitedAccess = isPro;
  
  const [puskice, setPuskice] = useState<PuskiceItem[]>([]);
  const [remaining, setRemaining] = useState(5);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showQuickView, setShowQuickView] = useState<PuskiceItem | null>(null);
  const [editingItem, setEditingItem] = useState<PuskiceItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setPuskice(getAllPuskice());
    setRemaining(getRemainingToday());
  }, []);

  const handleCreate = () => {
    // Pro bypasses daily limit
    if (!hasUnlimitedAccess && !canCreatePuskica()) {
      setShowProModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  const handleSave = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: "Greška",
        description: "Molimo unesi naslov i sadržaj.",
        variant: "destructive",
      });
      return;
    }

    const result = createPuskica(newTitle.trim(), newContent.trim(), hasUnlimitedAccess);

    // Only show pro modal if not unlimited access
    if (!result.success && !hasUnlimitedAccess) {
      setShowCreateModal(false);
      setShowProModal(true);
      return;
    }

    setPuskice(getAllPuskice());
    setRemaining(getRemainingToday());
    setNewTitle("");
    setNewContent("");
    setShowCreateModal(false);

    toast({
      title: "Uspješno!",
      description: "Puškica je kreirana.",
    });
  };

  const handleEdit = (item: PuskiceItem) => {
    setEditingItem(item);
    setNewTitle(item.title);
    setNewContent(item.content);
  };

  const handleUpdate = () => {
    if (!editingItem) return;
    
    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: "Greška",
        description: "Molimo unesi naslov i sadržaj.",
        variant: "destructive",
      });
      return;
    }

    const success = updatePuskica(editingItem.id, newTitle.trim(), newContent.trim());
    
    if (success) {
      setPuskice(getAllPuskice());
      setEditingItem(null);
      setNewTitle("");
      setNewContent("");
      toast({
        title: "Uspješno!",
        description: "Puškica je ažurirana.",
      });
    }
  };

  const handleDelete = (id: string) => {
    deletePuskica(id);
    setPuskice(getAllPuskice());
    toast({
      title: "Obrisano",
      description: "Puškica je obrisana.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Moje Puškice</h2>
        </div>
        <div className="flex items-center gap-3">
          {hasUnlimitedAccess ? (
            <span className="flex items-center gap-1 text-sm text-amber-400 font-semibold">
              <Shield className="w-4 h-4" />
              {isLifetimePro ? "Lifetime Pro" : "Pro"} - Unlimited
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Preostalo danas: <span className="font-bold text-primary">{remaining}/5</span>
            </span>
          )}
          <Button
            onClick={handleCreate}
            size="sm"
            className="bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nova
          </Button>
        </div>
      </div>

      {/* Grid of Puskice */}
      {puskice.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nemaš još puškica</h3>
            <p className="text-muted-foreground mb-4">Kreiraj svoju prvu puškicu za brzo učenje!</p>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Kreiraj Prvu Puškicu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {puskice.map((item) => (
            <Card
              key={item.id}
              className="group border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {item.content}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickView(item)}
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="border-accent/30 text-accent hover:bg-accent/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Puškica</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Kreiraj novu puškicu za brzo ponavljanje.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Input
                placeholder="Naslov (npr. Matematika - Formule)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Textarea
                placeholder="Sadržaj puškice..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={6}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Odustani
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
            >
              Spremi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick View Modal */}
      <Dialog open={!!showQuickView} onOpenChange={() => setShowQuickView(null)}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground pr-8">{showQuickView?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {showQuickView?.content}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={() => { setEditingItem(null); setNewTitle(""); setNewContent(""); }}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Uredi Puškicu</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Izmijeni naslov ili sadržaj puškice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Input
                placeholder="Naslov (npr. Matematika - Formule)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Textarea
                placeholder="Sadržaj puškice..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={6}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => { setEditingItem(null); setNewTitle(""); setNewContent(""); }}
              className="flex-1"
            >
              Odustani
            </Button>
            <Button
              onClick={handleUpdate}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
            >
              Spremi Izmjene
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal open={showProModal} onOpenChange={setShowProModal} />
    </div>
  );
}
