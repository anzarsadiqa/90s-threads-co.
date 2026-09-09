import { useRef, useState } from "react";
import { ImagePlus, Images, Star, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";
const FOLDER = "products";
const MAX_IMAGES = 6;
const MAX_BYTES = 5 * 1024 * 1024;
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

async function signed(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data) throw new Error(error?.message ?? "Could not read image");
  return data.signedUrl;
}

type Props = {
  value: string[];
  onChange: (images: string[]) => void;
};

export function ProductImagePicker({ value, onChange }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [gallery, setGallery] = useState<string[] | null>(null);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const remaining = MAX_IMAGES - value.length;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const picked = Array.from(files);
    if (picked.length > remaining) {
      toast.error(`You can add ${remaining} more image${remaining === 1 ? "" : "s"}.`);
      return;
    }
    setUploading(true);
    const urls: string[] = [];
    try {
      for (const file of picked) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image.`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} is larger than 5MB.`);
          continue;
        }
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${FOLDER}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) {
          toast.error(error.message);
          continue;
        }
        urls.push(await signed(path));
      }
      if (urls.length > 0) {
        onChange([...value, ...urls].slice(0, MAX_IMAGES));
        toast.success(`${urls.length} image${urls.length === 1 ? "" : "s"} added`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function openGallery() {
    setGalleryOpen(true);
    if (gallery) return;
    setGalleryLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(FOLDER, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw new Error(error.message);
      const urls = await Promise.all(
        (data ?? []).filter((f) => f.id).map((f) => signed(`${FOLDER}/${f.name}`)),
      );
      setGallery(urls);
    } catch (e) {
      toast.error((e as Error).message);
      setGallery([]);
    } finally {
      setGalleryLoading(false);
    }
  }

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const makeFirst = (index: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    if (item) onChange([item, ...next]);
  };

  const addFromGallery = (url: string) => {
    if (value.includes(url)) {
      toast.error("Already added to this product.");
      return;
    }
    if (value.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images.`);
      return;
    }
    onChange([...value, url]);
  };

  return (
    <div className="block">
      <span className="micro-label">Images (first one is the main photo)</span>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading || remaining <= 0}
          className="micro-label inline-flex items-center gap-2 border border-ink/25 px-4 py-2.5 disabled:opacity-50"
        >
          <Upload className="size-4" /> {uploading ? "Uploading…" : "Upload images"}
        </button>
        <button
          type="button"
          onClick={openGallery}
          className="micro-label inline-flex items-center gap-2 border border-ink/25 px-4 py-2.5"
        >
          <Images className="size-4" /> Choose from gallery
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {value.length === 0 ? (
        <div className="mt-3 flex items-center gap-2 border border-dashed border-ink/25 p-6 text-sm text-muted-foreground">
          <ImagePlus className="size-5" /> No images yet — upload from your device or pick from the
          gallery.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="relative border border-ink/15">
              <img src={url} alt="" className="aspect-square w-full bg-muted object-cover" />
              {index === 0 && (
                <span className="micro-label absolute bottom-0 left-0 bg-ink px-1.5 py-0.5 text-[10px] text-paper">
                  Main
                </span>
              )}
              <div className="absolute right-1 top-1 flex gap-1">
                {index !== 0 && (
                  <button
                    type="button"
                    aria-label="Make main image"
                    onClick={() => makeFirst(index)}
                    className="bg-paper/90 p-1 text-ink hover:bg-accent hover:text-accent-foreground"
                  >
                    <Star className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => remove(index)}
                  className="bg-paper/90 p-1 text-ink hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {galleryOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink/70 p-4">
          <div className="my-8 w-full max-w-3xl border border-ink/20 bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl">Store gallery</h3>
              <button
                type="button"
                aria-label="Close gallery"
                onClick={() => setGalleryOpen(false)}
                className="border border-ink/25 p-2"
              >
                <X className="size-4" />
              </button>
            </div>
            {galleryLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading images…</p>
            ) : (gallery ?? []).length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No uploaded images yet.
              </p>
            ) : (
              <div className="mt-4 grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-5">
                {(gallery ?? []).map((url) => {
                  const selected = value.includes(url);
                  return (
                    <button
                      type="button"
                      key={url}
                      onClick={() => addFromGallery(url)}
                      className={`border ${selected ? "border-accent" : "border-ink/15"}`}
                    >
                      <img src={url} alt="" className="aspect-square w-full bg-muted object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              onClick={() => setGalleryOpen(false)}
              className="micro-label mt-5 w-full bg-ink py-3 text-paper"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
