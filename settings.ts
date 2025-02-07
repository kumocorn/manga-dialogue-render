export interface CharacterSetting {
    id: string;
    name: string;
    color: string;
  }
  
  export interface MangaDialogueSettings {
    characters: CharacterSetting[];
  }
  
  export const DEFAULT_SETTINGS: MangaDialogueSettings = {
    characters: [],
  };
  