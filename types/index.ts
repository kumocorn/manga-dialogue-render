export interface CharacterSettings {
    name: string;
    color: string;
    id: string;
  }
  
  export interface PluginSettings {
    characters: CharacterSettings[];
  }
  
  export const DEFAULT_SETTINGS: PluginSettings = {
    characters: [],
  };
  