import { Plugin} from "obsidian";
import { StyleManager } from "./components/styles";
import { saveCustomCSS, loadCSSFiles } from "./components/utils";
import { MangaDialogueSettingTab } from "./components/settings";
import { DEFAULT_SETTINGS, type PluginSettings } from "./components/types";
import { MangaDialogueRenderer } from "./components/dialogue";

export default class MangaDialoguePlugin extends Plugin {
  settings: PluginSettings;
  styleEl: HTMLStyleElement;
  styleManager: StyleManager;
  dialogueRenderer: MangaDialogueRenderer;

  async onload() {
		console.log("Manga-Dialogue-Render Loaded");
    await this.loadSettings()
    this.styleManager = new StyleManager(this.app, this.settings, this.manifest);

	this.styleEl = document.createElement("style");
	document.head.appendChild(this.styleEl);

    await loadCSSFiles(this.app, this.manifest, this.styleEl);
        this.styleManager.applyCustomStyles();
	this.registerMarkdownCodeBlockProcessor("serihu", (source, el, ctx) => {
		this.dialogueRenderer = new MangaDialogueRenderer(this, source, el);
    })
	
	this.addSettingTab(new MangaDialogueSettingTab(this.app, this, this.manifest ));
	}

  onunload() {
		saveCustomCSS(this.app, this.manifest, this.styleManager, true);
		document.head.removeChild(this.styleEl);
	}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  
	async saveSettings() {
		await this.saveData(this.settings);
		await saveCustomCSS(this.app, this.manifest, this.styleManager, false);
	}

}
