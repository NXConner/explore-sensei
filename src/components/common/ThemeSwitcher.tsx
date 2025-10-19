import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/monitoring';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Monitor, Moon, Sun, Eye, Church, Zap } from 'lucide-react';
import { getAvailableThemes, getTheme, type Theme, type DesignSystemConfig } from '@/config/design-system';

interface ThemeSwitcherProps {
  onThemeChange?: (theme: Theme) => void;
  onConfigChange?: (config: DesignSystemConfig) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ onThemeChange, onConfigChange }) => {
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  const [config, setConfig] = useState<DesignSystemConfig>({
    currentTheme: 'light',
    fontSize: 'base',
    reducedMotion: false,
    highContrast: false,
    churchMode: false,
  });
  const [isOpen, setIsOpen] = useState(false);

  const themes = getAvailableThemes();

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('aos_theme');
    const savedConfig = localStorage.getItem('aos_design_config');
    
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
    
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        logger.warn('Failed to parse saved design config', { error });
      }
    }
  }, []);

  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName);
    const theme = getTheme(themeName);
    
    // Apply theme CSS variables
    const root = document.documentElement;
    const cssVariables = generateCSSVariables(theme);
    
    // Create style element if it doesn't exist
    let styleElement = document.getElementById('theme-variables') as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'theme-variables';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `:root { ${cssVariables} }`;
    
    // Save to localStorage
    localStorage.setItem('aos_theme', themeName);
    
    onThemeChange?.(theme);
  };

  const handleConfigChange = (newConfig: Partial<DesignSystemConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // Save to localStorage
    localStorage.setItem('aos_design_config', JSON.stringify(updatedConfig));
    
    // Apply configuration
    applyConfig(updatedConfig);
    
    onConfigChange?.(updatedConfig);
  };

  const applyConfig = (config: DesignSystemConfig) => {
    const root = document.documentElement;
    
    // Apply font size
    root.style.setProperty('--font-size-base', getFontSize(config.fontSize));
    
    // Apply reduced motion
    if (config.reducedMotion) {
      root.style.setProperty('--animation-duration', '0ms');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    // Apply high contrast
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply church mode
    if (config.churchMode) {
      root.classList.add('church-mode');
    } else {
      root.classList.remove('church-mode');
    }
  };

  const getFontSize = (size: string) => {
    const sizes = {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    };
    return sizes[size as keyof typeof sizes] || '1rem';
  };

  const generateCSSVariables = (theme: Theme): string => {
    const variables: string[] = [];
    
    // Primary colors
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      variables.push(`--color-primary-${key}: ${value};`);
    });
    
    // Background colors
    Object.entries(theme.colors.background).forEach(([key, value]) => {
      variables.push(`--color-background-${key}: ${value};`);
    });
    
    // Text colors
    Object.entries(theme.colors.text).forEach(([key, value]) => {
      variables.push(`--color-text-${key}: ${value};`);
    });
    
    return variables.join('\n');
  };

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'division':
        return <Monitor className="h-4 w-4" />;
      case 'animus':
        return <Zap className="h-4 w-4" />;
      case 'high-contrast':
        return <Eye className="h-4 w-4" />;
      case 'church-classic':
        return <Church className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
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
        <Palette className="h-4 w-4" />
        Theme
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-80 z-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme & Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((theme) => (
                  <Button
                    key={theme.name}
                    variant={currentTheme === theme.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange(theme.name)}
                    className="justify-start gap-2"
                  >
                    {getThemeIcon(theme.name)}
                    {theme.displayName}
                  </Button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Font Size</Label>
              <Select
                value={config.fontSize}
                onValueChange={(value) => handleConfigChange({ fontSize: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="base">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Accessibility Options */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Accessibility</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduced-motion" className="text-sm">
                      Reduced Motion
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={config.reducedMotion}
                    onCheckedChange={(checked) => handleConfigChange({ reducedMotion: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast" className="text-sm">
                      High Contrast
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={config.highContrast}
                    onCheckedChange={(checked) => handleConfigChange({ highContrast: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Church Mode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="church-mode" className="text-sm">
                    Church Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Optimize interface for church parking lot projects
                  </p>
                </div>
                <Switch
                  id="church-mode"
                  checked={config.churchMode}
                  onCheckedChange={(checked) => handleConfigChange({ churchMode: checked })}
                />
              </div>
            </div>

            {/* Current Theme Info */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                {getThemeIcon(currentTheme)}
                <span className="text-sm font-medium">
                  {themes.find(t => t.name === currentTheme)?.displayName}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {themes.find(t => t.name === currentTheme)?.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
