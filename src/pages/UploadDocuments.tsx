import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";

const UploadDocuments = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    const newUploaded: string[] = [];

    for (const file of files) {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("customer-documents")
        .upload(filePath, file);

      if (uploadError) {
        toast({ title: `Failed to upload ${file.name}`, description: uploadError.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("customer-documents")
        .getPublicUrl(filePath);

      await supabase.from("customer_documents").insert({
        user_id: user.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
      });

      newUploaded.push(file.name);
    }

    setUploaded(prev => [...prev, ...newUploaded]);
    setFiles([]);
    setUploading(false);
    if (newUploaded.length > 0) {
      toast({ title: "Upload complete", description: `${newUploaded.length} file(s) uploaded successfully.` });
    }
  };

  return (
    <MobileLayout title="Upload Documents" showBack>
      <div className="px-5 pt-5">
        <p className="text-sm text-muted-foreground mb-4">Upload documents related to your key orders</p>

        {/* Drop zone */}
        <Card
          className="border-dashed cursor-pointer active:scale-[0.99] transition-transform mb-4"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Upload className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">Tap to select files</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
          </CardContent>
        </Card>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Selected files */}
        {files.length > 0 && (
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-semibold text-foreground">Selected Files</h3>
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <button onClick={() => removeFile(idx)} className="text-muted-foreground p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button className="w-full" onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : `Upload ${files.length} file(s)`}
            </Button>
          </div>
        )}

        {/* Uploaded */}
        {uploaded.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Uploaded</h3>
            {uploaded.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2 text-accent text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default UploadDocuments;
