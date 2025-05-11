import React from 'react';
import { Dialog } from '@headlessui/react';
import { BiX } from 'react-icons/bi';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const fontSizes = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
  { id: 'x-large', label: 'Extra Large' }
];

const themes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'sepia', label: 'Sepia' }
];

export default function QuranSettings({
  isOpen,
  onClose,
  settings,
  onSettingChange,
  onExport,
  onImport
}) {
  const { theme, toggleTheme } = useTheme();

  const handleThemeChange = (newTheme) => {
    toggleTheme(newTheme);
    onSettingChange('theme', newTheme);
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          onImport(data);
        } catch (error) {
          console.error('Failed to import settings:', error);
          toast.error('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-sm" />

        <div className="relative bg-theme-primary rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <BiX size={28} />
          </button>

          <Dialog.Title className="text-3xl font-bold text-theme-primary mb-8">
            Settings
          </Dialog.Title>

          <div className="space-y-8">
            {/* Font Size */}
            <div>
              <label className="block text-lg font-medium text-theme-secondary mb-4">
                Font Size
              </label>
              <div className="grid grid-cols-4 gap-3">
                {fontSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => onSettingChange('fontSize', size.id)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      settings.fontSize === size.id
                        ? 'bg-accent-theme text-white shadow-lg scale-105'
                        : 'bg-theme-secondary text-theme-primary hover:bg-opacity-90 hover:scale-105'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-lg font-medium text-theme-secondary mb-4">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      theme === themeOption.id
                        ? 'bg-accent-theme text-white shadow-lg scale-105'
                        : 'bg-theme-secondary text-theme-primary hover:bg-opacity-90 hover:scale-105'
                    }`}
                  >
                    {themeOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="space-y-6">
              <label className="flex items-center space-x-4 p-4 rounded-xl bg-theme-secondary hover:bg-opacity-90 transition-all duration-200 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.showTranslation}
                  onChange={(e) => onSettingChange('showTranslation', e.target.checked)}
                  className="form-checkbox h-6 w-6 text-accent-theme rounded-lg focus:ring-accent-theme transition-colors"
                />
                <span className="text-lg text-theme-primary group-hover:text-accent-theme transition-colors">Show Translation</span>
              </label>

              <label className="flex items-center space-x-4 p-4 rounded-xl bg-theme-secondary hover:bg-opacity-90 transition-all duration-200 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.autoPlayNext}
                  onChange={(e) => onSettingChange('autoPlayNext', e.target.checked)}
                  className="form-checkbox h-6 w-6 text-accent-theme rounded-lg focus:ring-accent-theme transition-colors"
                />
                <span className="text-lg text-theme-primary group-hover:text-accent-theme transition-colors">Auto Play Next Verse</span>
              </label>

              <label className="flex items-center space-x-4 p-4 rounded-xl bg-theme-secondary hover:bg-opacity-90 transition-all duration-200 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.repeatVerse}
                  onChange={(e) => onSettingChange('repeatVerse', e.target.checked)}
                  className="form-checkbox h-6 w-6 text-accent-theme rounded-lg focus:ring-accent-theme transition-colors"
                />
                <span className="text-lg text-theme-primary group-hover:text-accent-theme transition-colors">Repeat Current Verse</span>
              </label>
            </div>

            {/* Import/Export */}
            <div className="flex flex-col space-y-4 pt-6 border-t border-theme-secondary">
              <button
                onClick={onExport}
                className="w-full px-6 py-4 bg-theme-secondary text-theme-primary rounded-xl hover:bg-opacity-90 transition-all duration-200 text-lg font-medium hover:scale-105 transform"
              >
                Export Settings
              </button>
              <label className="w-full px-6 py-4 bg-theme-secondary text-theme-primary rounded-xl hover:bg-opacity-90 transition-all duration-200 text-lg font-medium hover:scale-105 transform text-center cursor-pointer">
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 