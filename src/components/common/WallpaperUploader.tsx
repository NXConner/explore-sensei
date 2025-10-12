import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image, X, Check, AlertCircle } from 'lucide-react';
import { defaultWallpapers, type Wallpaper, type WallpaperCategory } from '@/config/design-system';

interface WallpaperUploaderProps {
  onWallpaperChange?: (wallpaper: Wallpaper | null) => void;
  currentWallpaper?: Wallpaper | null;
}

export const WallpaperUploader: React.FC<WallpaperUploaderProps> = ({ 
  onWallpaperChange, 
  currentWallpaper 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WallpaperCategory>('abstract');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      setUploadStatus('error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      setUploadStatus('error');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadStatus('idle');
    setUploadError('');
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');

    try {
      // In a real application, you would upload to a server
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newWallpaper: Wallpaper = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: previewUrl,
        thumbnail: previewUrl,
        category: selectedCategory,
        isCustom: true,
        createdBy: 'current-user', // In real app, get from auth
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage (in real app, save to database)
      const savedWallpapers = JSON.parse(localStorage.getItem('custom_wallpapers') || '[]');
      savedWallpapers.push(newWallpaper);
      localStorage.setItem('custom_wallpapers', JSON.stringify(savedWallpapers));

      setUploadStatus('success');
      onWallpaperChange?.(newWallpaper);

      // Reset form
      setTimeout(() => {
        setUploadStatus('idle');
        setPreviewUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      setUploadStatus('error');
      setUploadError('Failed to upload wallpaper. Please try again.');
    }
  };

  const handleWallpaperSelect = (wallpaper: Wallpaper) => {
    onWallpaperChange?.(wallpaper);
  };

  const handleRemoveWallpaper = () => {
    onWallpaperChange?.(null);
  };

  const getWallpapersByCategory = (category: WallpaperCategory) => {
    const customWallpapers = JSON.parse(localStorage.getItem('custom_wallpapers') || '[]');
    return [...defaultWallpapers, ...customWallpapers].filter(w => w.category === category);
  };

  const getCategoryIcon = (category: WallpaperCategory) => {
    switch (category) {
      case 'nature':
        return '🌿';
      case 'abstract':
        return '🎨';
      case 'church':
        return '⛪';
      case 'construction':
        return '🏗️';
      case 'custom':
        return '📁';
      default:
        return '🖼️';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Image className="h-4 w-4" />
        Wallpaper
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-96 z-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Wallpaper Settings
            </CardTitle>
            <CardDescription>
              Choose a background wallpaper for your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gallery" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="gallery" className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as WallpaperCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abstract">Abstract</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="church">Church</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {getWallpapersByCategory(selectedCategory).map((wallpaper) => (
                    <div
                      key={wallpaper.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        currentWallpaper?.id === wallpaper.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleWallpaperSelect(wallpaper)}
                    >
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-2">
                        <p className="text-xs font-medium truncate">{wallpaper.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs">{getCategoryIcon(wallpaper.category)}</span>
                          {wallpaper.isCustom && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              Custom
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {currentWallpaper && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Current Wallpaper</p>
                        <p className="text-xs text-muted-foreground">{currentWallpaper.name}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveWallpaper}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallpaper-file" className="text-sm font-medium">
                      Select Image
                    </Label>
                    <Input
                      id="wallpaper-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, GIF. Max size: 10MB
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as WallpaperCategory)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abstract">Abstract</SelectItem>
                        <SelectItem value="nature">Nature</SelectItem>
                        <SelectItem value="church">Church</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {previewUrl && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Preview</Label>
                      <div className="relative rounded-lg overflow-hidden border">
                        <img
                          src={previewUrl}
                          alt="Wallpaper preview"
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {uploadError}
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={!previewUrl || uploadStatus === 'uploading'}
                    className="w-full gap-2"
                  >
                    {uploadStatus === 'uploading' ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Uploading...
                      </>
                    ) : uploadStatus === 'success' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Uploaded!
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Wallpaper
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
