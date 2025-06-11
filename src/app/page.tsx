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


export default function HomePage() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [processedImagePreview, setProcessedImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Clean up URLs when component unmounts or previews change
    return () => {
      if (originalImagePreview) URL.revokeObjectURL(originalImagePreview);
      // No need to revoke processedImagePreview if it's a static placeholder URL
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
      setProcessedImagePreview(null); // Reset processed image on new upload
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
      description: "AI is removing the background. This may take a moment.",
    });

    // Simulate API call to Claid AI
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate receiving processed image
    // In a real app, this would be the URL from Claid AI or a data URL of the processed image
    const randomCacheBuster = Math.random().toString(36).substring(7);
    setProcessedImagePreview(`https://placehold.co/600x400/000000/FFFFFF/png?text=Processed+Image&random=${randomCacheBuster}`);
    
    setIsLoading(false);
    toast({
      title: "Background Removed!",
      description: "Your image has been processed successfully.",
      variant: "default",
    });
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

    // Simulate download
    const link = document.createElement('a');
    link.href = processedImagePreview;
    // Add a query parameter to suggest a filename, as placehold.co doesn't support content-disposition
    link.download = `ClaidCut_${originalImageFile?.name.split('.')[0] || 'image'}_bg_removed.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: "Your image is being downloaded.",
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
            Upload your image and let our Claid AI powered tool remove the background in seconds.
            Simple, fast, and effective.
          </p>
        </div>

        <Alert className="mb-8 bg-card border-primary">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="font-semibold text-primary">Powered by Claid AI (Simulated)</AlertTitle>
          <AlertDescription>
            This demo simulates background removal using the Claid AI model.
            In a real application, your image would be processed by Claid AI.
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
              {isLoading ? 'Processing...' : 'Remove Background'}
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
                      alt="Processed image preview"
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
