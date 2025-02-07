import { App, PluginSettingTab, Setting, TextComponent, ButtonComponent } from "obsidian";
import { nanoid } from "nanoid";
import type { MangaDialoguePlugin } from "../main";
import type { CharacterSettings } from "./types";

export class MangaDialogueSettingTab extends PluginSettingTab {
  plugin: MangaDialoguePlugin;

  constructor(app: App, plugin: MangaDialoguePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    this.createCharacterAddSection(containerEl);
    containerEl.createEl("h4", { text: "Character List" });
    this.plugin.settings.characters.forEach((char, index) => {
      this.createCharacterEditRow(containerEl, char, index);
    });
  }

  private createCharacterAddSection(containerEl: HTMLElement): void {
    let inputValue = "";
    let textInput: TextComponent;

    new Setting(containerEl)
      .setName("Add New Character")
      .setDesc("Type character name and press add button")
      .addText((text) => {
        textInput = text;
        text.setPlaceholder("New Character Name")
          .onChange((value) => inputValue = value);
      })
      .addButton((button) =>
        button
          .setIcon("user-plus")
          .setTooltip("Add character")
          .onClick(async () => {
            await this.addNewCharacter(inputValue, textInput);
          })
      );
  }

  private async addNewCharacter(name: string, textInput: TextComponent): Promise<void> {
    if (name.trim() === "") return;
    if (this.plugin.settings.characters.some((char) => char.name === name)) return;

    const newID = `characterID-${nanoid(6)}`;
    this.plugin.settings.characters.push({
      name,
      color: "#ffffff",
      id: newID,
    });

    await this.plugin.saveSettings();
    textInput.setValue("");
    this.display();
  }

  private createCharacterEditRow(
    containerEl: HTMLElement, 
    character: CharacterSettings, 
    index: number
  ): void {
    const setting = new Setting(containerEl);
    
    const nameSpan = setting.nameEl.createEl("span", { 
      text: character.name,
      cls: "character-name"
    });

    setting.addColorPicker(picker => 
      picker
        .setValue(character.color)
        .onChange(async (value) => {
          this.plugin.settings.characters[index].color = value;
          await this.plugin.saveSettings();
        })
    );

    const textComponent = new TextComponent(setting.controlEl);
    textComponent.inputEl.style.display = "none";
    textComponent.inputEl.classList.add("character-name-input");

    const editButton = new ButtonComponent(setting.controlEl)
      .setIcon("pencil")
      .setTooltip("Edit Name")
      .onClick(() => {
        if (textComponent.inputEl.style.display === "none") {
          this.startEditing(nameSpan, textComponent, editButton);
        } else {
          this.confirmEditing(nameSpan, textComponent, editButton, index);
        }
      });

    setting.addButton(button => 
      button
        .setIcon("user-round-x")
        .setTooltip("Remove Character")
        .setWarning()
        .onClick(async () => {
          await this.removeCharacter(index);
        })
    );
  }

  private startEditing(
    nameSpan: HTMLElement,
    textComponent: TextComponent,
    editButton: ButtonComponent
  ): void {
    nameSpan.style.display = "none";
    textComponent.inputEl.style.display = "inline-block";
    textComponent.setValue(nameSpan.textContent || "");
    textComponent.inputEl.focus();
    editButton
      .setIcon("check")
      .setTooltip("Confirm!");
  }

  private async confirmEditing(
    nameSpan: HTMLElement,
    textComponent: TextComponent,
    editButton: ButtonComponent,
    index: number
  ): Promise<void> {
    const newName = textComponent.getValue().trim();
    
    if (newName !== "" && newName !== nameSpan.textContent) {
      nameSpan.textContent = newName;
      this.plugin.settings.characters[index].name = newName;
      await this.plugin.saveSettings();
    }

    textComponent.inputEl.style.display = "none";
    nameSpan.style.display = "inline-block";
    editButton
      .setIcon("pencil")
      .setTooltip("Edit Name");
  }

  private async removeCharacter(index: number): Promise<void> {
    this.plugin.settings.characters.splice(index, 1);
    await this.plugin.saveSettings();
    this.display();
  }
}
