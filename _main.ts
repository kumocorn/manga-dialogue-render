import { Plugin } from "obsidian";
import { DialogueRenderer } from "./components/dialogue";
import { StyleManager } from "./components/styles";
import { MangaDialogueSettingTab } from "./components/settings";
import { DEFAULT_SETTINGS, type PluginSettings } from "./components/types";

export default class MangaDialoguePlugin extends Plugin {
  settings: PluginSettings;
  private styleManager: StyleManager;
  private dialogueRenderer: DialogueRenderer;

  async onload() {
    console.log("Manga-Dialogue-Plugin Loaded");
	console.log("Loading settings...");
    await this.loadSettings();
	console.log("Settings loaded:", this.settings);
    this.styleManager = new StyleManager(this, this.settings);
    await this.styleManager.initialize();
    
    this.dialogueRenderer = new DialogueRenderer(this.settings);
    
    this.addSettingTab(new MangaDialogueSettingTab(this.app, this));
    
    this.registerMarkdownCodeBlockProcessor(
      "serihu",
      (source, el, ctx) => this.dialogueRenderer.render(source, el, ctx)
    );
  }

  onunload() {
    console.log("Manga-Dialogue-Plugin Unloaded");
    this.styleManager.cleanup();
  }

  async loadSettings() {
	this.settings = Object.assign({ characters: [] }, await this.loadData());
	console.log("Settings loaded:", this.settings); // デバッグ用
  }

  async saveSettings() {
    await this.saveData(this.settings);
    await this.styleManager.updateStyles();
  }
}
