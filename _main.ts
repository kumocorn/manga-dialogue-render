import { Plugin } from 'obsidian';
import { nanoid } from 'nanoid';
import type { PluginSettings } from './types';
import { DEFAULT_SETTINGS } from './types';
import { FileManager } from './utils/file';
import { generateCustomStyles, updateCharacterClasses } from './utils/styles';
import { DialogueRenderer } from './components/Dialogue';
import { MangaDialogueSettingTab } from './components/SettingsTab';

export default class MangaDialoguePlugin extends Plugin {
  settings: PluginSettings;
  styleEl: HTMLStyleElement;
  fileManager: FileManager;

  async onload() {
    console.log("Manga-Dialogue-Plugin Loaded");
    
    this.fileManager = new FileManager(this.app, this.manifest.id, this.manifest.dir);
    
    await this.loadSettings();
    await this.initializeStyles();
    
    this.addSettingTab(new MangaDialogueSettingTab(this.app, this));
    
    this.registerMarkdownCodeBlockProcessor("serihu", (source, el, ctx) => {
      const renderer = new DialogueRenderer(this.settings.characters);
      renderer.render(source, el);
    });
  }

  private async initializeStyles(): Promise<void> {
    await this.fileManager.loadStylesheet("font.css");
    this.styleEl = document.createElement("style");
    document.head.appendChild(this.styleEl);
    await this.updateStyles();
    await this.fileManager.loadStylesheet("color.css");
  }

  // ... 残りのメソッド
}
