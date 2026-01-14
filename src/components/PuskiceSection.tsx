import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Eye, Trash2, FileText, Sparkles, Shield, Pencil, Image, X } from "lucide-react";
import { FullscreenModal } from "@/components/FullscreenModal";
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
  const [showFullscreenImage, setShowFullscreenImage] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PuskiceItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImageUrl, setNewImageUrl] = useState<string | undefined>(undefined);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const refresh = () => {
    const items = [...getAllPuskice()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setPuskice(items);
    setRemaining(getRemainingToday());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = () => {
    // Pro bypasses daily limit
    if (!hasUnlimitedAccess && !canCreatePuskica()) {
      setShowProModal(true);
      return;
    }
    setNewImageUrl(undefined);
    setShowCreateModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    const result = createPuskica(newTitle.trim(), newContent.trim(), newImageUrl, hasUnlimitedAccess);

    // Only show pro modal if not unlimited access
    if (!result.success && !hasUnlimitedAccess) {
      setShowCreateModal(false);
      setShowProModal(true);
      return;
    }

    refresh();
    setNewTitle("");
    setNewContent("");
    setNewImageUrl(undefined);
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
    setNewImageUrl(item.imageUrl);
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

    const success = updatePuskica(editingItem.id, newTitle.trim(), newContent.trim(), newImageUrl);
    
    if (success) {
      refresh();
      setEditingItem(null);
      setNewTitle("");
      setNewContent("");
      setNewImageUrl(undefined);
      toast({
        title: "Uspješno!",
        description: "Puškica je ažurirana.",
      });
    }
  };

  const handleDelete = (id: string) => {
    deletePuskica(id);
    refresh();
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
                  {item.imageUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFullscreenImage(item.imageUrl!)}
                      className="border-accent/30 text-accent hover:bg-accent/10"
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                  )}
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

      {/* Shared hidden image picker (works for Create + Edit) */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Create - Fullscreen */}
      <FullscreenModal
        open={showCreateModal}
        title="Nova Puškica"
        description="Kreiraj novu puškicu za brzo ponavljanje."
        onClose={() => setShowCreateModal(false)}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
              Odustani
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Spremi
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            placeholder="Naslov (npr. Matematika - Formule)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />

          <Textarea
            placeholder="Sadržaj puškice..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={10}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
          />

          {/* Image Upload */}
          <div>
            {newImageUrl ? (
              <div className="relative">
                <img
                  src={newImageUrl}
                  alt="Preview"
                  className="w-full max-h-[40vh] object-contain rounded-lg border border-border bg-muted/30"
                  loading="lazy"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setNewImageUrl(undefined)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-2 h-20"
                onClick={() => imageInputRef.current?.click()}
              >
                <Image className="w-5 h-5 mr-2" />
                Dodaj sliku
              </Button>
            )}
          </div>
        </div>
      </FullscreenModal>

      {/* Quick View - Fullscreen */}
      <FullscreenModal
        open={!!showQuickView}
        title={showQuickView?.title ?? "Puškica"}
        onClose={() => setShowQuickView(null)}
        footer={
          <Button variant="outline" onClick={() => setShowQuickView(null)} className="w-full">
            Zatvori
          </Button>
        }
      >
        <div className="space-y-4">
          {showQuickView?.imageUrl ? (
            <button
              type="button"
              className="w-full"
              onClick={() => setShowFullscreenImage(showQuickView.imageUrl!)}
              aria-label="Otvori sliku preko cijelog ekrana"
              title="Otvori sliku"
            >
              <img
                src={showQuickView.imageUrl}
                alt={`Slika za: ${showQuickView.title}`}
                className="w-full max-h-[45vh] object-contain rounded-lg border border-border bg-muted/30"
                loading="lazy"
              />
            </button>
          ) : null}

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{showQuickView?.content}</p>
          </div>
        </div>
      </FullscreenModal>

      {/* Edit - Fullscreen */}
      <FullscreenModal
        open={!!editingItem}
        title="Uredi Puškicu"
        description="Izmijeni naslov, sadržaj ili sliku puškice."
        onClose={() => {
          setEditingItem(null);
          setNewTitle("");
          setNewContent("");
          setNewImageUrl(undefined);
        }}
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditingItem(null);
                setNewTitle("");
                setNewContent("");
                setNewImageUrl(undefined);
              }}
              className="flex-1"
            >
              Odustani
            </Button>
            <Button onClick={handleUpdate} className="flex-1">
              Spremi Izmjene
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            placeholder="Naslov (npr. Matematika - Formule)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />

          <Textarea
            placeholder="Sadržaj puškice..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={10}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
          />

          {/* Image Upload */}
          <div>
            {newImageUrl ? (
              <div className="relative">
                <img
                  src={newImageUrl}
                  alt="Preview"
                  className="w-full max-h-[40vh] object-contain rounded-lg border border-border bg-muted/30"
                  loading="lazy"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setNewImageUrl(undefined)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-2 h-20"
                onClick={() => imageInputRef.current?.click()}
              >
                <Image className="w-5 h-5 mr-2" />
                Dodaj sliku
              </Button>
            )}
          </div>
        </div>
      </FullscreenModal>

      {/* Fullscreen Image Modal */}
      {showFullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={() => setShowFullscreenImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => setShowFullscreenImage(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img 
            src={showFullscreenImage} 
            alt="Fullscreen" 
            className="max-w-full max-h-full object-contain p-4"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal open={showProModal} onOpenChange={setShowProModal} />
    </div>
  );
}
