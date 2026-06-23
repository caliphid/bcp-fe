import React, { useState, useEffect } from "react";
import { Modal } from "./modal";
import { transactionsApi } from "../../features/transactions/api";
import { Loader2 } from "lucide-react";

interface AttachmentViewerModalProps {
  url: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttachmentViewerModal({ url, isOpen, onClose }: AttachmentViewerModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      let isMounted = true;
      setLoading(true);
      setError(false);
      
      transactionsApi.downloadFile(url)
        .then((blob) => {
          if (!isMounted) return;
          const objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          setLoading(false);
        })
        .catch(() => {
          if (!isMounted) return;
          setError(true);
          setLoading(false);
        });

      return () => {
        isMounted = false;
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
      };
    } else {
      setBlobUrl(null);
    }
  }, [isOpen, url]);

  if (!url) return null;

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Attachment Preview" className="max-w-4xl">
      <div className="w-full h-[70vh] bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative">
        {loading && (
          <div className="flex flex-col items-center text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-sm">Loading attachment...</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="text-red-500 text-center">
            <p>Failed to load attachment.</p>
            <p className="text-xs mt-1">You may not have permission or the file is missing.</p>
          </div>
        )}

        {blobUrl && !loading && !error && (
          isPdf ? (
            <iframe src={blobUrl} className="w-full h-full border-0" title="PDF Preview" />
          ) : (
            <img src={blobUrl} alt="Attachment" className="max-w-full max-h-full object-contain" />
          )
        )}
      </div>
    </Modal>
  );
}
