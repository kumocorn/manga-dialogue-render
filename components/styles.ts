import { Plugin, Setting } from "obsidian";
import type { PluginSettings } from "./types";
import path from "path";

export class StyleManager {
  private styleEl: HTMLStyleElement;
  private plugin: Plugin;
  private settings: PluginSettings; // 追加

  constructor(plugin: Plugin, settings: PluginSettings) { // settings を受け取る
    this.plugin = plugin; // ここで明示的にセット
    this.styleEl = document.createElement("style");
    console.log("StyleManager initialized with settings:", this.settings); // ← デバッグ用
    this.styleEl = document.createElement("style");
    document.head.appendChild(this.styleEl);
    console.log("StyleManager initialized with plugin:", this.plugin); // 追加
  }

  async initialize() {
    await this.loadStylesheet("font.css");
    await this.updateStyles();
    await this.loadStylesheet("color.css");
  }

  async loadStylesheet(filename: string) {
    const cssPath = await this.getAssetPath(filename, true);
    try {
      const response = await fetch(cssPath);
      if (!response.ok) {
        console.error(`Failed to load ${filename}:`, response.statusText);
        return;
      }

      const cssText = await response.text();
      const style = document.createElement("style");
      style.textContent = cssText;
      document.head.appendChild(style);
    } catch (err) {
      console.error(`Failed to fetch ${filename}:`, err);
    }
  }

  async saveStylesheet(filename: string, cssText: string) {
    console.log("this.plugin:", this.plugin); // ← ここで確認
    console.log("this.plugin.app:", this.plugin?.app); // ← ここで確認
		const pluginPath = await this.getAssetPath(filename, false);
		try {
			const dirPath = path.dirname(pluginPath);
			const dirExists = await this.app.vault.adapter.exists(dirPath);
			if (!dirExists) {
				await this.app.vault.adapter.mkdir(dirPath);
			}

			await this.app.vault.adapter.write(pluginPath, await cssText);
		} catch (err) {
			console.error(`Failed to save ${filename}:`, err);
		}
	}

  async updateStyles() {
    console.log("Updating styles with settings:", this.plugin.settings); // デバッグ用
    const cssContent = await this.generateCustomStyles();
    await this.saveStylesheet("color.css", cssContent);
    this.updateCharacterClasses();
  }

	async updateCharacterClasses() {
    console.log("this.settings.characters:", this.settings.characters); // ← デバッグ用

      if (!this.settings || !this.settings.characters) {
        console.error("Error: settings or characters is undefined");
        return;
      }

      const characterContainers = document.querySelectorAll(
        ".character-container-left, .character-container-right"
      );
      characterContainers.forEach((container) => {
        container.classList.forEach((cls) => {
          if (cls.startsWith("characterID-")) {
            container.classList.remove(cls);
          }
        });

			const characterName = container
				.querySelector(".serihu-char")
				?.textContent?.trim();
			if (!characterName) return;

			const characterID =
				this.settings.characters.find((c) => c.name === characterName)
					?.id || "default";
			container.classList.add(characterID);
		});
	}

  private async getAssetPath(filename: string, forReading: boolean = true): Promise<string> {
    const fullPath = `skin/${filename}`;
    if (forReading) {
      return this.plugin.app.vault.adapter.getResourcePath(
        `${this.plugin.manifest.dir}/${fullPath}`
      );
    }
    return path.join(
      ".obsidian",
      "plugins",
      this.plugin.manifest.id,
      fullPath
    );
  }

  private async generateCustomStyles(): Promise<string> {
    let rootCss = ":root {\n";
    let customCss = "";
    const uniqueIds = new Set<string>();

    const templatePath = await this.getAssetPath("_color.tpl", true);
    const response = await fetch(templatePath);
    if (!response.ok) {
      console.error("Failed to load template:", response.statusText);
      return "";
    }
    const template = await response.text();

    this.plugin.settings.characters.forEach((char) => {
      if (uniqueIds.has(char.id)) return;
      uniqueIds.add(char.id);

      rootCss += `  --${char.id}-color: ${char.color}; /* ${char.name} */ \n`;
      customCss += template
        .replace(/{{id}}/g, char.id)
        .replace(/{{name}}/g, char.name);
    });

    rootCss += "}\n";
    return rootCss + customCss;
  }

  cleanup() {
    document.head.removeChild(this.styleEl);
  }
}
