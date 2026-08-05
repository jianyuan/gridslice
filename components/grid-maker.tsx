"use client";

import { useRef, useState } from "react";
import { SpecCard } from "./spec-card";
import {
  CropIcon,
  Download,
  ImageDown,
  RotateCcw,
  Upload,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Cropper, { Area } from "react-easy-crop";
import {
  GeneratedTile,
  generateTiles,
  getTileGeometry,
  overallCropAspect,
  PixelCrop,
} from "@/lib/grid";
import JSZip from "jszip";
import { Button } from "./ui/button";

const COLUMN_OPTIONS = [2, 3, 4] as const;
const ROW_OPTIONS = [1, 2, 3] as const;

const MARGIN_SWATCHES = [
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Cream", value: "#f5f0e8" },
  { label: "Stone", value: "#e7e5e4" },
];

export function GridMaker() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(1);
  const [marginColor, setMarginColor] = useState("#ffffff");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropSize, setCropSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);

  const [tiles, setTiles] = useState<GeneratedTile[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspect = overallCropAspect(columns, rows);
  const geo = getTileGeometry();

  const handleCropComplete = (_area: Area, areaPixels: Area) => {
    setPixelCrop(areaPixels);
  };

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setTiles(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageSrc || !pixelCrop) return;
    setBusy(true);
    try {
      const result = await generateTiles({
        imageSrc,
        crop: pixelCrop,
        columns,
        rows,
        marginColor,
      });
      setTiles(result);
    } finally {
      setBusy(false);
    }
  };

  const downloadTile = (url: string, index: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `grid-tile-${String(index + 1).padStart(2, "0")}.png`;
    a.click();
  };

  const downloadAll = async () => {
    if (!tiles) return;
    const zip = new JSZip();
    tiles.forEach((tile, i) => {
      const base64 = tile.uploadUrl.split(",")[1];
      zip.file(`grid-tile-${String(i + 1).padStart(2, "0")}.png`, base64, {
        base64: true,
      });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `instagram-grid-${rows}x${columns}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setImageSrc(null);
    setTiles(null);
    setPixelCrop(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {!imageSrc ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => {
            setDragging(false);
          }}
          onDrop={onDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border bg-card px-6 py-20 text-center transition-colors hover:bg-muted/50",
            dragging && "border-primary bg-accent",
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Upload className="size-7" />
          </span>
          <span className="text-lg font-medium text-card-foreground">
            Drop a photo here, or click to upload
          </span>
          <span className="max-w-md text-pretty text-sm text-muted-foreground">
            Everything runs locally in your browser. Your image never leaves
            your device.
          </span>
        </button>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-neutral-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                minZoom={1}
                maxZoom={4}
                restrictPosition
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropSizeChange={setCropSize}
                onCropComplete={handleCropComplete}
                objectFit="contain"
              />

              {/* Split guides */}
              {cropSize && (
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ width: cropSize.width, height: cropSize.height }}
                >
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: columns - 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-full border-r border-white/60"
                        style={{ width: `${100 / columns}%` }}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: rows - 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-full border-b border-white/60"
                        style={{ height: `${100 / rows}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Zoom"
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
            </div>

            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CropIcon className="size-4 shrink-0" />
              Frame your shot inside the {rows}×{columns} guides: a{" "}
              <span className="font-medium text-foreground">
                {columns * 3}:{rows * 4}
              </span>{" "}
              crop split into {rows * columns} posts.
            </p>
          </div>

          <Controls
            columns={columns}
            setColumns={(c) => {
              setColumns(c);
              setTiles(null);
            }}
            rows={rows}
            setRows={(r) => {
              setRows(r);
              setTiles(null);
            }}
            marginColor={marginColor}
            setMarginColor={(c) => {
              setMarginColor(c);
              setTiles(null);
            }}
            onGenerate={handleGenerate}
            onReset={reset}
            busy={busy}
          />
        </div>
      )}

      {tiles && (
        <Results
          tiles={tiles}
          columns={columns}
          rows={rows}
          onDownloadTile={downloadTile}
          onDownloadAll={downloadAll}
        />
      )}

      <SpecCard
        columns={columns}
        rows={rows}
        marginPx={geo.marginSide}
        marginPct={geo.marginPct}
      />
    </div>
  );
}

function Controls({
  columns,
  setColumns,
  rows,
  setRows,
  marginColor,
  setMarginColor,
  onGenerate,
  onReset,
  busy,
}: {
  columns: number;
  setColumns: (c: number) => void;
  rows: number;
  setRows: (r: number) => void;
  marginColor: string;
  setMarginColor: (c: string) => void;
  onGenerate: () => void;
  onReset: () => void;
  busy: boolean;
}) {
  return (
    <aside className="flex h-fit flex-col gap-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-card-foreground">Rows</span>
        <div className="grid grid-cols-3 gap-2">
          {ROW_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRows(r)}
              className={cn(
                "flex items-center justify-center rounded-xl border px-2 py-3 text-sm font-medium transition-colors",
                rows === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-accent",
              )}
            >
              {r} {r === 1 ? "row" : "rows"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-card-foreground">
          Columns
        </span>
        <div className="grid grid-cols-3 gap-2">
          {COLUMN_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColumns(c)}
              className={cn(
                "flex items-center justify-center rounded-xl border px-2 py-3 text-sm font-medium transition-colors",
                columns === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-accent",
              )}
            >
              {c} cols
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
        <span className="text-muted-foreground">Layout</span>{" "}
        <span className="font-semibold text-foreground">
          {rows}×{columns}
        </span>{" "}
        <span className="text-muted-foreground">
          · {rows * columns} {rows * columns === 1 ? "post" : "posts"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-card-foreground">
          Margin fill
        </span>
        <div className="flex flex-wrap gap-2">
          {MARGIN_SWATCHES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setMarginColor(s.value)}
              aria-label={s.label}
              className={cn(
                "size-9 rounded-full border shadow-sm transition-transform",
                marginColor.toLowerCase() === s.value.toLowerCase()
                  ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-card"
                  : "border-border",
              )}
              style={{ backgroundColor: s.value }}
            />
          ))}
          <label
            className="relative flex size-9 cursor-pointer items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground"
            title="Custom color"
          >
            <input
              type="color"
              value={marginColor}
              onChange={(e) => setMarginColor(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            +
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={onGenerate}
          disabled={busy}
          size="lg"
          className="w-full"
        >
          {busy ? "Generating…" : "Generate grid"}
        </Button>
        <Button
          onClick={onReset}
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          <RotateCcw className="size-4" />
          Start over
        </Button>
      </div>
    </aside>
  );
}

function Results({
  tiles,
  columns,
  rows,
  onDownloadTile,
  onDownloadAll,
}: {
  tiles: GeneratedTile[];
  columns: number;
  rows: number;
  onDownloadTile: (url: string, index: number) => void;
  onDownloadAll: () => void;
}) {
  const total = rows * columns;
  return (
    <section className="mt-12 flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Profile grid preview
            </h2>
            <p className="text-sm text-muted-foreground">
              How the 3:4 tiles line up on your profile — margins cropped away.
            </p>
          </div>
          <Button onClick={onDownloadAll}>
            <Download className="size-4" />
            Download all ({total}) as ZIP
          </Button>
        </div>

        <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card p-1">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {tiles.map((tile, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={tile.gridUrl}
                alt={`Grid tile row ${tile.row + 1} column ${tile.col + 1}`}
                className="min-w-0 object-cover"
                style={{ aspectRatio: "3 / 4" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Downloadable 4:5 tiles */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Your 4:5 tiles to upload
          </h2>
          <p className="max-w-2xl text-pretty text-sm text-muted-foreground">
            Each file is 1080 × 1350 with side margins. Post them in{" "}
            <span className="font-medium text-foreground">reverse order</span>{" "}
            (tile {total} first, tile 1 last) so they land in reading order from
            left to right, top to bottom on your grid.
          </p>
        </div>

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {tiles.map((tile, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="relative overflow-hidden rounded-lg border border-border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.uploadUrl || "/placeholder.svg"}
                  alt={`Upload tile ${i + 1}`}
                  className="w-full"
                  style={{ aspectRatio: "4 / 5" }}
                />
                <span className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-full bg-foreground/80 text-xs font-semibold text-background">
                  {i + 1}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadTile(tile.uploadUrl, i)}
              >
                <ImageDown className="size-4" />
                Tile {i + 1} · R{tile.row + 1}C{tile.col + 1}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
