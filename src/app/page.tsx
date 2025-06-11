
'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { UploadCloud, DownloadCloud, Sparkles, Image as ImageIcon, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { removeBackground } from '@/ai/flows/remove-background-flow';


export default function HomePage() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [processedImagePreview, setProcessedImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (originalImagePreview) URL.revokeObjectURL(originalImagePreview);
      // Processed image preview will be a URL from Eden AI, no need to revoke
    };
  }, [originalImagePreview]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setOriginalImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setOriginalImagePreview(previewUrl);
      setProcessedImagePreview(null); 
      toast({
        title: "Image Selected",
        description: `${file.name} is ready for background removal.`,
      });
    }
  };

  const handleRemoveBackground = async () => {
    if (!originalImageFile) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Processing Image...",
      description: "Eden AI is removing the background. This may take a moment.",
    });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(originalImageFile);
      reader.onloadend = async () => {
        const imageDataUri = reader.result as string;
        try {
          const result = await removeBackground({ imageDataUri });
          
          setProcessedImagePreview(result.processedImageUri);
          setIsLoading(false);
          toast({
            title: "Background Removed!",
            description: "Your image has been processed successfully by Eden AI.",
            variant: "default",
          });
        } catch (error) {
          console.error("Error calling removeBackground flow:", error);
          setIsLoading(false);
          toast({
            title: "Processing Failed",
            description: error instanceof Error ? error.message : "Could not remove background using Eden AI.",
            variant: "destructive",
          });
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setIsLoading(false);
        toast({
          title: "File Read Error",
          description: "Could not read the selected image file.",
          variant: "destructive",
        });
      };
    } catch (error) {
      console.error("Error preparing image for background removal:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred before processing.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!processedImagePreview) {
      toast({
        title: "No Processed Image",
        description: "Please process an image first.",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement('a');
    link.href = processedImagePreview;
    link.download = `ClaidCut_${originalImageFile?.name.split('.')[0] || 'image'}_bg_removed.png`;
    // For cross-origin images (like those from Eden AI), "download" attribute might not work as expected
    // without proper CORS headers on the server providing the image.
    // Opening in a new tab is a common fallback.
    link.target = '_blank'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Initiated",
      description: "Your image should be opening in a new tab for download.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-headline font-bold mb-4">
            AI Background Remover
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your image and let our AI powered tool remove the background in seconds.
            Simple, fast, and effective.
          </p>
        </div>

        <Alert className="mb-8 bg-card border-primary">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="font-semibold text-primary">Powered by Eden AI</AlertTitle>
          <AlertDescription>
            Your image will be processed using the Eden AI API for background removal.
          </AlertDescription>
        </Alert>

        <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UploadCloud className="h-7 w-7 text-primary" />
              Upload Your Image
            </CardTitle>
            <CardDescription>
              Select an image file (PNG, JPG, WEBP) up to 5MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-base">Image File</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
                className="file:text-primary file:font-medium hover:file:bg-primary/10"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleRemoveBackground}
              disabled={!originalImageFile || isLoading}
              className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-6 w-6" />
              )}
              {isLoading ? 'Processing...' : 'Remove Background with Eden AI'}
            </Button>
          </CardContent>
        </Card>

        {(originalImagePreview || processedImagePreview) && (
          <div className="mt-12 grid md:grid-cols-2 gap-8 items-start">
            {originalImagePreview && (
              <Card className="shadow-xl bg-card animate-fadeIn">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ImageIcon className="h-6 w-6 text-accent" />
                    Original Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video relative rounded-lg overflow-hidden border border-border">
                    <Image
                      src={originalImagePreview}
                      alt="Original image preview"
                      layout="fill"
                      objectFit="contain"
                      data-ai-hint="user uploaded image"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {processedImagePreview && (
              <Card className="shadow-xl bg-card animate-fadeIn">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Processed Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video relative rounded-lg overflow-hidden border border-border">
                    <Image
                      src={processedImagePreview}
                      alt="Processed image preview from Eden AI"
                      layout="fill"
                      objectFit="contain"
                      data-ai-hint="image no background"
                    />
                  </div>
                  <Button
                    onClick={handleDownload}
                    disabled={isLoading || !processedImagePreview}
                    className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <DownloadCloud className="mr-2 h-6 w-6" />
                    Download Image
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
