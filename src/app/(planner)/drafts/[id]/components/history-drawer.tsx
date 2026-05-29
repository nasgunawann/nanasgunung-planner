"use client";

import React from "react";
import {
  IconHistory,
  IconDeviceFloppy,
  IconX,
  IconClockHour4,
} from "@tabler/icons-react";

type Props = {
  revisions: any[];
  handleCreateManualBackup: () => void;
  handleRestoreRevision: (rev: any) => void;
  setIsHistoryOpen: (v: boolean) => void;
};

export default function HistoryDrawer({
  revisions,
  handleCreateManualBackup,
  handleRestoreRevision,
  setIsHistoryOpen,
}: Props) {
  const formatTime = (ts: number) => {
    const dateObj = new Date(ts);
    return {
      timeStr: dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      dateStr: dateObj.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      }),
    };
  };

  return (
    <>
      <div className="p-3.5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/10">
        <span className="font-heading text-xs font-bold text-foreground flex items-center gap-1.5">
          <IconHistory className="size-3.5 text-primary" />
          Riwayat Versi
        </span>
        <button
          type="button"
          onClick={() => setIsHistoryOpen(false)}
          className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <IconX className="size-3.5" />
        </button>
      </div>

      <div className="p-3 border-b border-border/40 bg-muted/5 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-muted-foreground font-semibold">
          Penyimpanan Lokal (Offline)
        </span>
        <button
          type="button"
          onClick={handleCreateManualBackup}
          className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all cursor-pointer select-none"
        >
          <IconDeviceFloppy className="size-2.5" />
          Buat Cadangan
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <p className="text-[10px] text-muted-foreground leading-relaxed px-1 font-sans">
          Sistem mencatat maksimal 5 versi terakhir secara otomatis.
          Mengembalikan versi akan mencadangkan status saat ini.
        </p>

        {revisions.length > 0 ? (
          revisions.map((rev) => {
            const { timeStr, dateStr } = formatTime(rev.timestamp);
            return (
              <div
                key={rev.id}
                className="rounded-lg border border-border bg-background/50 p-2.5 space-y-2 text-[11px]"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-foreground flex items-center gap-1">
                      <IconClockHour4 className="size-3 text-primary/70" />
                      <span>{timeStr}</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground font-mono">
                      {dateStr}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestoreRevision(rev)}
                    className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer select-none"
                  >
                    Restore
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed bg-muted/15 p-2 rounded truncate max-h-[35px] overflow-hidden border border-border/20 font-mono">
                  {rev.content
                    ? rev.content.replace(/<[^>]*>/g, " ")
                    : "(Teks Kosong)"}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-muted-foreground font-sans">
            <p className="text-xs font-bold">Belum Ada Riwayat</p>
            <p className="text-[10px] max-w-[200px] mx-auto leading-relaxed mt-1">
              Cadangan versi draf otomatis akan terekam saat Anda mulai mengetik
              atau menyisipkan aset baru!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
