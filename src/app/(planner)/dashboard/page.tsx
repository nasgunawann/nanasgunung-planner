"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDrafts } from "@/lib/drafts";
import PageTransition from "@/components/page-transition";
import { AnimatePresence, m } from "motion/react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BrandInstagramIcon,
  BrandTiktokIcon,
  BrandYoutubeIcon,
  BrandLinkedinIcon,
} from "@/components/brand-icons";
import {
  IconCalendarEvent,
  IconPencil,
  IconSparkles,
  IconBooks,
  IconPlus,
  IconBulb,
  IconClock,
  IconTrendingUp,
  IconArrowRight,
  IconFileText,
  IconTemplate,
} from "@tabler/icons-react";

// Platform Icon mapping
const platformIcons: Record<string, any> = {
  Instagram: BrandInstagramIcon,
  TikTok: BrandTiktokIcon,
  YouTube: BrandYoutubeIcon,
  LinkedIn: BrandLinkedinIcon,
};

// Platform Theme colors
const platformColors: Record<string, string> = {
  Instagram:
    "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white",
  TikTok: "bg-black text-white dark:bg-white dark:text-black",
  YouTube: "bg-red-600 text-white",
  LinkedIn: "bg-sky-600 text-white",
};

function StatIconBadge({
  icon: Icon,
}: {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-background shadow-sm ring-1 ring-primary/15">
      <Icon className="size-5" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { drafts, ideas } = useDrafts();

  // Local storage state for Library items
  const [rawIdeasCount, setRawIdeasCount] = useState(0);
  const [snippetsCount, setSnippetsCount] = useState(0);
  const [customTemplatesCount, setCustomTemplatesCount] = useState(0);

  // Quick idea capture form state
  const [quickIdea, setQuickIdea] = useState("");
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);

  // Sync Library items counts from LocalStorage on mount
  useEffect(() => {
    try {
      const storedRaw = localStorage.getItem("nanas_raw_ideas");
      const storedSnippets = localStorage.getItem("nanas_snippets");
      const storedCustomTemplates = localStorage.getItem(
        "nanas_custom_templates",
      );

      if (storedRaw) setRawIdeasCount(JSON.parse(storedRaw).length);
      if (storedSnippets) setSnippetsCount(JSON.parse(storedSnippets).length);
      if (storedCustomTemplates)
        setCustomTemplatesCount(JSON.parse(storedCustomTemplates).length);
    } catch (e) {
      console.error("Error reading LocalStorage stats:", e);
    }
  }, []);

  // Quick Capture Idea Action
  const handleSaveQuickIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdea.trim()) return;

    setIsSubmittingIdea(true);
    try {
      const storedRaw = localStorage.getItem("nanas_raw_ideas");
      const currentRaw = storedRaw ? JSON.parse(storedRaw) : [];

      const newIdea = {
        id: `${Date.now()}`,
        content: quickIdea.trim(),
        createdAt: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };

      const updated = [newIdea, ...currentRaw];
      localStorage.setItem("nanas_raw_ideas", JSON.stringify(updated));
      setRawIdeasCount(updated.length);

      toast.success("Ide mentah berhasil dicatat secara instan!", {
        action: {
          label: "Lihat di Pustaka",
          onClick: () => router.push("/library?tab=raw_ideas"),
        },
      });
      setQuickIdea("");
    } catch (err) {
      toast.error("Gagal menyimpan ide cepat.");
    } finally {
      setIsSubmittingIdea(false);
    }
  };

  // Compute stats metrics
  const activeDraftsCount = drafts.filter((d) => d.status !== "Published").length;
  const scheduledDraftsCount = drafts.filter(
    (d) => d.date && d.status !== "Published",
  ).length;
  const publishedDraftsCount = drafts.filter(
    (d) => d.status === "Published",
  ).length;

  // Filter 3 recently updated drafts
  const recentDrafts = [...drafts].slice(0, 3);

  // Filter 3 upcoming scheduled drafts (chronologically, from today onwards)
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingDrafts = [...drafts]
    .filter((d) => d.status !== "Published" && d.date && d.date >= todayStr)
    .sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      return dateA.localeCompare(dateB);
    })
    .slice(0, 3);

  // Calculate platform distribution percentage
  const platformCounts: Record<string, number> = {
    Instagram: 0,
    TikTok: 0,
    YouTube: 0,
    LinkedIn: 0,
  };
  let totalPlatformDrafts = 0;
  drafts.forEach((d) => {
    if (d.platform && d.platform in platformCounts) {
      platformCounts[d.platform]++;
      totalPlatformDrafts++;
    }
  });

  const getPlatformPercentage = (platform: string) => {
    if (totalPlatformDrafts === 0) return 0;
    return Math.round((platformCounts[platform] / totalPlatformDrafts) * 100);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Upper Header Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Selamat datang kembali, Kreator!{" "}
                <span className="animate-bounce">👋</span>
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl">
                Rancang ide segar, kelola draf video, dan kembangkan konsep Anda
                dengan kecerdasan AI. Semua aset terintegrasi luring secara
                instan.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/calendar")}
                className="cursor-pointer"
              >
                <IconCalendarEvent className="size-4" />
                Buka Kalender
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/brainstorm")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold cursor-pointer"
              >
                <IconSparkles className="size-4" />
                Mulai Brainstorm AI
              </Button>
            </div>
          </div>
          {/* Subtle blurred background glow */}
          <div className="absolute -right-20 -top-20 -z-10 size-60 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* 4 Columns Analytics Stats Metrics Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Active Drafts Metrics */}
          <Card className="hover:shadow-md transition-all border-border/80 bg-card/60 backdrop-blur-sm group">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <div className="space-y-1">
                <CardDescription className="text-[11px] font-bold uppercase tracking-wider">
                  Draf Aktif
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold tracking-tight mt-1">
                  {activeDraftsCount}
                </CardTitle>
              </div>
              <StatIconBadge icon={IconPencil} />
            </CardHeader>
            <CardContent className="text-[10px] text-muted-foreground flex gap-2">
              <span className="font-medium text-orange-500">
                {scheduledDraftsCount} Terjadwal
              </span>
              <span>•</span>
              <span className="font-medium text-emerald-500">
                {publishedDraftsCount} Rilis
              </span>
            </CardContent>
          </Card>

          {/* Raw Ideas Metrics */}
          <Card className="hover:shadow-md transition-all border-border/80 bg-card/60 backdrop-blur-sm group">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <div className="space-y-1">
                <CardDescription className="text-[11px] font-bold uppercase tracking-wider">
                  Ide Mentah
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold tracking-tight mt-1">
                  {rawIdeasCount}
                </CardTitle>
              </div>
              <StatIconBadge icon={IconBulb} />
            </CardHeader>
            <CardContent className="text-[10px] text-muted-foreground">
              Ide kasar yang tersimpan di Pustaka
            </CardContent>
          </Card>

          {/* Quick Snippets Metrics */}
          <Card className="hover:shadow-md transition-all border-border/80 bg-card/60 backdrop-blur-sm group">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <div className="space-y-1">
                <CardDescription className="text-[11px] font-bold uppercase tracking-wider">
                  Aset Snippets
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold tracking-tight mt-1">
                  {snippetsCount}
                </CardTitle>
              </div>
              <StatIconBadge icon={IconBooks} />
            </CardHeader>
            <CardContent className="text-[10px] text-muted-foreground">
              Teks siap pakai untuk penyisipan instan
            </CardContent>
          </Card>

          {/* Custom Templates Metrics */}
          <Card className="hover:shadow-md transition-all border-border/80 bg-card/60 backdrop-blur-sm group">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <div className="space-y-1">
                <CardDescription className="text-[11px] font-bold uppercase tracking-wider">
                  Templat Kustom
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold tracking-tight mt-1">
                  {customTemplatesCount}
                </CardTitle>
              </div>
              <StatIconBadge icon={IconTemplate} />
            </CardHeader>
            <CardContent className="text-[10px] text-muted-foreground">
              Kerangka struktur buatan Anda
            </CardContent>
          </Card>
        </div>

        {/* Main Columns Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column Left (Span 2): WIP Drafts and Upcoming Queue */}
          <div className="lg:col-span-2 space-y-6">
            {/* Melanjutkan Pekerjaan (WIP Drafts) */}
            <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <IconClock className="size-4.5 text-primary" />
                    Melanjutkan Draf Terakhir
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Lanjutkan menulis draf konten yang baru-baru ini Anda
                    perbarui.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => router.push("/drafts")}
                  className="text-xs text-primary hover:text-primary/80 font-bold cursor-pointer"
                >
                  Lihat Semua
                  <IconArrowRight className="size-3" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {recentDrafts.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {recentDrafts.map((d) => {
                      const Icon =
                        (d.platform && platformIcons[d.platform]) ||
                        IconFileText;
                      return (
                        <div
                          key={d.id}
                          onClick={() => router.push(`/drafts/${d.id}`)}
                          className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Platform Icon */}
                            <Icon className="size-8 shrink-0" />
                            <div className="min-w-0 space-y-0.5">
                              <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate max-w-[280px] sm:max-w-[400px]">
                                {d.title}
                              </h4>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                <span>{d.category || "No Category"}</span>
                                <span>•</span>
                                <span>{d.updatedAt}</span>
                                {d.date && d.status !== "Published" && (
                                  <>
                                    <span>•</span>
                                    <span className="text-blue-500 font-semibold flex items-center gap-1 shrink-0">
                                      <IconClock className="size-3" />
                                      {new Date(d.date).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                d.status === "Published"
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : d.status === "In progress"
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                              }`}
                            >
                              {d.status || "Draft"}
                            </span>
                            <IconArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground space-y-1.5">
                    <IconPencil className="size-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs font-bold text-foreground">
                      Belum ada draf aktif
                    </p>
                    <p className="text-[11px] max-w-xs mx-auto">
                      Buat draf baru menggunakan tombol tambah di sudut kanan
                      bawah layar Anda.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Antrean Konten Terdekat (Upcoming Content) */}
            <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <IconCalendarEvent className="size-4.5 text-primary" />
                  Antrean Konten Terdekat
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Konten yang telah Anda jadwalkan dan siap rilis terdekat.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                {upcomingDrafts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {upcomingDrafts.map((d) => {
                      const Icon =
                        (d.platform && platformIcons[d.platform]) ||
                        IconFileText;
                      const formattedDate = d.date
                        ? new Date(d.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Tidak ada tanggal";
                      return (
                        <div
                          key={d.id}
                          onClick={() => router.push(`/drafts/${d.id}`)}
                          className="flex flex-col justify-between p-3.5 rounded-xl border border-border/80 bg-background/50 hover:bg-muted/40 transition-all cursor-pointer group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              {/* Platform tag */}
                              <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-muted-foreground">
                                <Icon className="size-5 shrink-0" />
                                {d.platform}
                              </div>
                              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                Ready
                              </span>
                            </div>
                            <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                              {d.title}
                            </h4>
                          </div>

                          <div className="mt-4 pt-2.5 border-t border-border/20 text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <IconClock className="size-3.5" />
                            {formattedDate}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/25">
                    <IconCalendarEvent className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs font-bold text-foreground">
                      Semua terjadwal telah selesai
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[280px] mx-auto">
                      Belum ada konten masa depan yang dijadwalkan. Tambahkan
                      tanggal di halaman Kalender.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/calendar")}
                      className="mt-3.5 cursor-pointer text-xs h-7"
                    >
                      Jadwalkan di Kalender
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Column Right: Quick-Capture Idea Box & Platform Distribution */}
          <div className="space-y-6">
            {/* Quick-Capture Raw Idea Box */}
            <Card className="border-border/80 bg-card/60 backdrop-blur-sm relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <IconBulb className="size-4.5 text-primary animate-pulse" />
                  Pencatat Ide Kilat
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Tulis pemikiran cepat atau ide konten kasar sebelum Anda
                  melupakannya!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveQuickIdea} className="space-y-3">
                  <Textarea
                    placeholder="Nanti bikin video tentang tips produktivitas untuk kreator..."
                    value={quickIdea}
                    onChange={(e) => setQuickIdea(e.target.value)}
                    rows={4}
                    className="text-xs resize-none bg-background/50 border-border/70 placeholder:text-muted-foreground/70"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isSubmittingIdea || !quickIdea.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs h-8 cursor-pointer"
                  >
                    <IconPlus className="size-3.5" />
                    Simpan Ide Mentah
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Platform Distribution Chart (Pure CSS) */}
            <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <IconTrendingUp className="size-4.5 text-primary" />
                  Analisis Saluran Platform
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Visualisasi sebaran jenis konten Anda di seluruh platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {totalPlatformDrafts > 0 ? (
                  <div className="space-y-3.5">
                    {/* Instagram */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold flex items-center gap-1 text-muted-foreground">
                          <BrandInstagramIcon className="size-3.5 text-pink-500" />
                          Instagram
                        </span>
                        <span className="font-bold text-foreground">
                          {platformCounts.Instagram} draf (
                          {getPlatformPercentage("Instagram")}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-orange-400 rounded-full transition-all duration-500"
                          style={{
                            width: `${getPlatformPercentage("Instagram")}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* TikTok */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold flex items-center gap-1 text-muted-foreground">
                          <BrandTiktokIcon className="size-3.5 text-foreground" />
                          TikTok
                        </span>
                        <span className="font-bold text-foreground">
                          {platformCounts.TikTok} draf (
                          {getPlatformPercentage("TikTok")}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground rounded-full transition-all duration-500"
                          style={{
                            width: `${getPlatformPercentage("TikTok")}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* YouTube */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold flex items-center gap-1 text-muted-foreground">
                          <BrandYoutubeIcon className="size-3.5 text-red-500" />
                          YouTube
                        </span>
                        <span className="font-bold text-foreground">
                          {platformCounts.YouTube} draf (
                          {getPlatformPercentage("YouTube")}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${getPlatformPercentage("YouTube")}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold flex items-center gap-1 text-muted-foreground">
                          <BrandLinkedinIcon className="size-3.5 text-sky-600" />
                          LinkedIn
                        </span>
                        <span className="font-bold text-foreground">
                          {platformCounts.LinkedIn} draf (
                          {getPlatformPercentage("LinkedIn")}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${getPlatformPercentage("LinkedIn")}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-[11px] text-muted-foreground">
                    Belum ada sebaran data platform. Tambahkan draf konten
                    terlebih dahulu!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
