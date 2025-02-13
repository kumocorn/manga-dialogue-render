import {
	App,
	PluginSettingTab,
	Setting,
	TextComponent,
	ButtonComponent,
	PluginManifest,
} from "obsidian";
import { nanoid } from 'nanoid';
import MangaDialoguePlugin from "../main";
import { PluginSettings } from "./types";
import { loadStylesheet } from "./utils";

export class MangaDialogueSettingTab extends PluginSettingTab {
	plugin: MangaDialoguePlugin;


	private generalSettingsContainer: HTMLElement;
	private characterListContainer: HTMLElement;
	private generalSettingsTab: HTMLElement;
	private characterListTab: HTMLElement;
	private manifest: PluginManifest;

	constructor(app: App, plugin: MangaDialoguePlugin, manifest: PluginManifest) {
		super(app, plugin);
		this.plugin = plugin;
    this.manifest = manifest
		this.generalSettingsContainer = document.createElement("div");
		this.characterListContainer = document.createElement("div");
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const { generalSettingsContainer, characterListContainer } =
			this.createTabs(containerEl);

		this.createGeneralSettingsTab(generalSettingsContainer);
		this.createCharacterListTab(characterListContainer);
	}

  /* Tabs */
	private createTabs(containerEl: HTMLElement): {
		generalSettingsContainer: HTMLElement;
		characterListContainer: HTMLElement;
	} {
		const tabContainer = containerEl.createDiv();
		const generalSettingsTab = tabContainer.createEl("button", {
			text: "General Settings",
		});
		const characterListTab = tabContainer.createEl("button", {
			text: "Character List",
		});

		generalSettingsTab.classList.add("tab-button");
		characterListTab.classList.add("tab-button");

		const generalSettingsContainer = containerEl.createDiv();
		const characterListContainer = containerEl.createDiv();
		generalSettingsContainer.addClass("tab-content");
		characterListContainer.addClass("tab-content");

		generalSettingsContainer.style.display = "block";
		characterListContainer.style.display = "none";

		generalSettingsTab.addEventListener("click", () =>
			this.switchTab(
				generalSettingsContainer,
				characterListContainer,
				generalSettingsTab,
				characterListTab
			)
		);
		characterListTab.addEventListener("click", () =>
			this.switchTab(
				characterListContainer,
				generalSettingsContainer,
				characterListTab,
				generalSettingsTab
			)
		);

		tabContainer.appendChild(generalSettingsTab);
		tabContainer.appendChild(characterListTab);
		generalSettingsTab.classList.add("active");

		return { generalSettingsContainer, characterListContainer };
	}

	private switchTab(
		showEl: HTMLElement,
		hideEl: HTMLElement,
		activeTab: HTMLElement,
		inactiveTab: HTMLElement
	): void {
		showEl.style.display = "block";
		hideEl.style.display = "none";
		activeTab.classList.add("active");
		inactiveTab.classList.remove("active");
	}

  /* desc */
	private createDescFragment(
		descEn: string,
		descJp: string
	): DocumentFragment {
		const desc = document.createDocumentFragment();
		desc.append(descEn, desc.createEl("br"), descJp);
		return desc;
	}

	/* General Settings */
	private createGeneralSettingsTab(containerEl: HTMLElement): void {
		containerEl.empty();

		containerEl.createEl("h2", { text: "Appearance" });

		this.addSetting(
			"Text Color",
			"Sets the color of the text.",
			"文字の色を設定します。",
			"color",
			"textColor",
			"#202020",
			containerEl
		);
		this.addSetting(
			"Bubble Background Color",
			"Sets the background color of the speech bubble.",
			"吹き出しの背景色を設定します。",
			"color",
			"backgroundColor",
			"#faf5f0",
			containerEl
		);
		this.addSetting(
			"Bubble Border Color",
			"Sets the border color of the speech bubble.",
			"吹き出しの枠線の色を設定します。",
			"color",
			"borderColor",
			"#000000",
			containerEl
		);

		this.addSetting(
			"Bubble height",
			"Sets the maximum height of speech bubbles.",
			"吹き出しの最大の高さを変更します。",
			"text",
			"bubbleHeight",
			"12em",
			containerEl
		);
		this.addSetting(
			"Comment width",
			"Sets the maximum width of the comment area.",
			"コメントエリアの最大の幅を変更します。",
			"text",
			"commentWidth",
			"60%",
			containerEl
		);

		containerEl.createEl("h2", { text: "Font" });
		this.addSetting(
			"Typeface for nomal font.",
			"Specifies the normal dialogue font.",
			"通常の台詞フォントを指定します。",
			"text",
			"defaultFont",
			"源暎アンチック v5",
			containerEl
		);
		this.addSetting(
			"Typeface for :monologue",
			"Specifies the font for monologue dialogue.",
			"モノローグ用のフォントを指定します。",
			"text",
			"monologueFont",
			"源柔ゴシック",
			containerEl
		);
		this.addSetting(
			"Typeface for :pop",
			"Specifies the font for pop-style dialogue.",
			"ポップ系の台詞に使用するフォントを指定します。",
			"text",
			"popFont",
			"Mochiy Pop One",
			containerEl
		);
		this.addSetting(
			"Typeface for :strong",
			"Specifies the font for strong dialogue.",
			"力強い台詞に使用するフォントを指定します。",
			"text",
			"strongFont",
			"源暎エムゴv2",
			containerEl
		);
		this.addSetting(
			"Typeface for :weak",
			"Specifies the font for weak voice dialogue.",
			"弱々しい台詞に使用するフォントを指定します。",
			"text",
			"weakFont",
			"851チカラヨワク",
			containerEl
		);
		this.addSetting(
			"Typeface for :horror",
			"Specifies the font for horror dialogue.",
			"ホラー系の台詞に使用するフォントを指定します。",
			"text",
			"horrorFont",
			"g_コミックホラー恐怖-教漢",
			containerEl
		);
	}

	private addSetting(
		name: string,
		descEn: string,
		descJp: string,
		type: "color" | "text",
		settingKey: Exclude<keyof PluginSettings, "characters">, // "characters" を除外
		placeholderOrDefault: string,
		containerEl: HTMLElement
	): void {
		const setting = new Setting(containerEl)
			.setName(name)
			.setDesc(this.createDescFragment(descEn, descJp));

		if (type === "color") {
			setting
				.addColorPicker((color) =>
					color
						.setValue(
							this.plugin.settings[settingKey] ||
								placeholderOrDefault
						)
						.onChange(async (value) => {
							this.plugin.settings[settingKey] = value;
							await this.batchSaveSettings();
						})
				)
				.addButton((button) =>
					button
						.setIcon("rotate-ccw")
						.setTooltip("Reset to Default Color")
						.onClick(async () => {
							this.plugin.settings[settingKey] =
								placeholderOrDefault;
							await this.batchSaveSettings();
							this.display();
						})
				);
		} else if (type === "text") {
			setting.addText((text) =>
				text
					.setPlaceholder(`ex: ${placeholderOrDefault}`)
					.setValue(this.plugin.settings[settingKey] || "")
					.onChange(async (value) => {
						this.plugin.settings[settingKey] = value;
						await this.batchSaveSettings();
					})
			);
		}
	}

	createCharacterListTab(containerEl: HTMLElement): void {
		containerEl.empty();

		this.createCharacterInput(containerEl);
		const characterListSection = containerEl.createDiv();
		characterListSection.createEl("h2", { text: "Character List" });
		this.createCharacterList(containerEl);
	}

	//characters settings
	private createCharacterInput(containerEl: HTMLElement): void {
		let inputValue = "";
		let textInput: TextComponent;

		new Setting(containerEl)
			.setName("Add New Character")
			.setDesc(
				this.createDescFragment(
					"Type character name and press add button. You can set the character color.",
					"キャラクター名を入力して追加ボタンを押してください。キャラクターカラーを設定できます。"
				)
			)
			.addText((text) => {
				textInput = text;
				text.setPlaceholder("New Character Name").onChange(
					(value) => (inputValue = value)
				);
			})
			.addButton((button) =>
				button
					.setIcon("user-plus")
					.setTooltip("Add character")
					.onClick(async () => {
						if (inputValue.trim() === "") return;
						if (
							this.plugin.settings.characters.some(
								(char) => char.name === inputValue
							)
						)
							return;

						const newID = `${nanoid(6)}`;

						this.plugin.settings.characters.push({
							name: inputValue,
							color: "#ffffff",
							id: newID,
						});

						await this.batchSaveSettings();
						textInput.setValue("");
						
            loadStylesheet(this.app, this.manifest, "color.css");
            console.log("cssを再読込しました")
						this.createCharacterListTab(containerEl);
					})
			);
	}

	private createCharacterList(containerEl: HTMLElement): void {
		this.plugin.settings.characters.forEach((char, index) => {
			this.createCharacterSetting(containerEl, char, index);
		});
	}

	private createCharacterSetting(
		containerEl: HTMLElement,
		char: { name: string; color: string; id: string },
		index: number
	): void {
		const setting = new Setting(containerEl);

		const nameSpan = setting.nameEl.createEl("span", { text: char.name });

		setting.addColorPicker((picker) =>
			picker.setValue(char.color).onChange(async (value) => {
				const oldColor = this.plugin.settings.characters[index].color;
				if (oldColor !== value) {
					this.plugin.settings.characters[index].color = value;
					this.plugin.styleManager.updateCharacterColor([
						this.plugin.settings.characters[index],
					]);
					await this.batchSaveSettings();
				}
			})
		);

		const textComponent = new TextComponent(setting.controlEl);
		textComponent.inputEl.style.display = "none";

		const editButton = new ButtonComponent(setting.controlEl)
			.setIcon("pencil")
			.setTooltip("Edit Name")
			.onClick(() => {
				if (textComponent.inputEl.style.display === "none") {
					nameSpan.style.display = "none";
					textComponent.inputEl.style.display = "";
					textComponent.setValue(nameSpan.textContent || "");
					editButton.setIcon("check").setTooltip("Confirm!");
				} else {
					const newName = textComponent.getValue().trim();
					if (newName !== "") {
						nameSpan.textContent = newName;
						this.plugin.settings.characters[index].name = newName;
						this.batchSaveSettings();
					}
					textComponent.inputEl.style.display = "none";
					nameSpan.style.display = "";
					editButton.setIcon("pencil").setTooltip("Edit Name");
				}
			});

		setting.addButton((button) =>
			button
				.setIcon("user-round-x")
				.setTooltip("Remove Character")
				.setWarning()
				.onClick(async () => {
					this.plugin.settings.characters.splice(index, 1);
					await this.batchSaveSettings();
          loadStylesheet(this.app, this.manifest, "color.css");
					this.createCharacterListTab(containerEl);
				})
		);
	}

	private async batchSaveSettings() {
		await this.plugin.saveSettings();
	
		const updatedCharacters = this.plugin.settings.characters.filter((character) => character.color);
		this.plugin.styleManager.applyCustomStyles(updatedCharacters);
	}
}
