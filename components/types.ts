export interface CharacterSettings {
  name: string;
  color: string;
  id: string;
}

export interface PluginSettings {
  characters: CharacterSettings[];
  textColor: string;
  backgroundColor: string;
  borderColor:  string;
  bubbleHeight:  string;
  commentWidth:  string;
  defaultFont: string;
  monologueFont: string;
  popFont: string;
  strongFont: string;
  weakFont: string;
  horrorFont: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  characters: [],
  textColor: "#202020",
  backgroundColor: "#faf5f0",
  borderColor: "#000000",
  bubbleHeight: "12em",
  commentWidth: "60%",
  defaultFont: "",
  monologueFont: "",
  popFont: "",
  strongFont: "",
  weakFont: "",
  horrorFont: "",
};
