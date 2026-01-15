import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProUpgradeModal } from "./ProUpgradeModal";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Eye, Trash2, FileText, Sparkles, Shield, X, Loader2, Upload, BookOpen } from "lucide-react";
import { FullscreenModal, cleanText } from "@/components/FullscreenModal";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";

interface PuskiceItem {
  id: string;
  title: string;
  content: string;
  subject?: string;
  created_at: string;
}

const DAILY_LIMIT = 5;

export function PuskiceSection() {
  const { isPro, isLifetimePro, user } = useSupabaseAuth();
  const hasUnlimitedAccess = isPro;
  
  const [puskice, setPuskice] = useState<PuskiceItem[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showQuickView, setShowQuickView] = useState<PuskiceItem | null>(null);
  const [subject, setSubject] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Compress image client-side for speed (smaller upload to AI)
  const compressImageToDataUrl = (file: File, maxSide = 1280, quality = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const longest = Math.max(img.width, img.height);
          const scale = longest > maxSide ? maxSide / longest : 1;
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas not supported");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } catch (e) {
          URL.revokeObjectURL(objectUrl);
          reject(e);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image load failed"));
      };
      img.src = objectUrl;
    });
  };

  // Fetch puskice from database
  const fetchPuskice = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("puskice")
      .select("id,title,content,subject,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching puskice:", error);
      return;
    }

    setPuskice(data || []);

    // Count today's creations
    const today = new Date().toISOString().split("T")[0];
    const todayItems = (data || []).filter(
      (item) => item.created_at.split("T")[0] === today
    );
    setTodayCount(todayItems.length);
  };

  useEffect(() => {
    fetchPuskice();
  }, [user]);

  const remaining = Math.max(0, DAILY_LIMIT - todayCount);

  // Get unique subjects for history filter
  const subjects = [...new Set(puskice.map((p) => p.subject).filter(Boolean))] as string[];

  // Filter puskice by selected subject
  const filteredPuskice = selectedSubjectFilter
    ? puskice.filter((p) => p.subject === selectedSubjectFilter)
    : puskice;

  const handleCreate = () => {
    if (!hasUnlimitedAccess && todayCount >= DAILY_LIMIT) {
      setShowProModal(true);
      return;
    }
    setSubject("");
    setImageUrl(undefined);
    setShowCreateModal(true);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageToDataUrl(file);
      setImageUrl(compressed);
    } catch {
      // Fallback to raw FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractAndSave = async () => {
    if (!subject.trim()) {
      toast({
        title: "Greška",
        description: "Molimo unesi naziv predmeta.",
        variant: "destructive",
      });
      return;
    }

    if (!imageUrl) {
      toast({
        title: "Greška",
        description: "Molimo dodaj sliku za ekstrakciju.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Greška",
        description: "Morate biti prijavljeni.",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);

    try {
      // Call AI extraction edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-puskica`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageUrl, subject: subject.trim() }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Ekstrakcija nije uspjela");
      }

      // Save to database with detected subject from AI
      const { error: insertError } = await supabase.from("puskice").insert({
        user_id: user.id,
        title: result.title || subject.trim(),
        content: result.content,
        subject: result.subject || subject.trim(),
      });

      if (insertError) {
        throw insertError;
      }

      await fetchPuskice();
      setSubject("");
      setImageUrl(undefined);
      setShowCreateModal(false);

      toast({
        title: "Uspješno! ✨",
        description: "AI je ekstrahirao informacije i kreirao puškicu.",
      });
    } catch (error) {
      console.error("Extraction error:", error);
      toast({
        title: "Greška",
        description: error instanceof Error ? error.message : "Nešto nije u redu.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("puskice").delete().eq("id", id);

    if (error) {
      toast({
        title: "Greška",
        description: "Nije moguće obrisati puškicu.",
        variant: "destructive",
      });
      return;
    }

    await fetchPuskice();
    toast({
      title: "Obrisano",
      description: "Puškica je obrisana.",
    });
  };

  return (
    <div className="space-y-6">
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

      {/* AI Upload Section */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Brza Puškica</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Uploaduj sliku i unesi predmet - AI automatski ekstrahira formule, definicije, datume i ključne osobe!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Naziv predmeta (npr. Matematika)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => imageInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {imageUrl ? "Promijeni sliku" : "Dodaj sliku"}
            </Button>
            <Button
              onClick={handleExtractAndSave}
              disabled={!subject.trim() || !imageUrl || isExtracting}
              className="gap-2"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ekstrahiram...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Kreiraj
                </>
              )}
            </Button>
          </div>
          {imageUrl && (
            <div className="relative mt-3">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full max-h-40 object-contain rounded-lg border border-border bg-muted/30"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => setImageUrl(undefined)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject Filter / History */}
      {subjects.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Istorija po predmetima:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSubjectFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubjectFilter(null)}
            >
              Sve ({puskice.length})
            </Button>
            {subjects.map((subj) => (
              <Button
                key={subj}
                variant={selectedSubjectFilter === subj ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubjectFilter(subj)}
              >
                {subj} ({puskice.filter((p) => p.subject === subj).length})
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Puskice */}
      {filteredPuskice.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {selectedSubjectFilter ? `Nema puškica za "${selectedSubjectFilter}"` : "Nemaš još puškica"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Uploaduj sliku i unesi predmet gore za brzu AI ekstrakciju!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPuskice.map((item) => (
            <Card
              key={item.id}
              className="group border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                    {item.title}
                  </CardTitle>
                  {item.subject && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {item.subject}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4 mb-4 whitespace-pre-wrap">
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
                    Pogledaj
                  </Button>
                  {/* Image is intentionally not stored in DB */}
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

      {/* Hidden image picker */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Quick View Modal - Updated Layout */}
      <FullscreenModal
        open={!!showQuickView}
        title={showQuickView?.title ?? "Puškica"}
        subject={showQuickView?.subject}
        onClose={() => setShowQuickView(null)}
        footer={
          <Button variant="outline" onClick={() => setShowQuickView(null)} className="w-full">
            Zatvori
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base">
              {cleanText(showQuickView?.content || '')}
            </p>
          </div>
        </div>
      </FullscreenModal>
      {/* Pro Upgrade Modal */}
      <ProUpgradeModal open={showProModal} onOpenChange={setShowProModal} />
    </div>
  );
}
