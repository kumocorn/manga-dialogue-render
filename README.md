# Obsidian Manga Dialogue Render
[English](README.md)  | [日本語](README-JP.md) 

*English text is machine translated.*

This plugin renders character dialogue written in codeblock in a manga-style.  
![alt text](<docs/Pasted image 20250213232117.png>)
- Character dialogue ("台詞(serihu)") is displayed in a speech bubble.  
- You can change the font and speech bubble shape. 
- You can add characters to a list and customize the speech bubble color.
 
I hope this will give you visual inspiration for creating manga plots!
 
Sorry, this is a plugin for Japanese language.  
Please use existing great plugins for horizontal text!

## Usage
 
Simply set the left and right character names in the `serihu` code block and write the dialogue with a prefix.
#### Example
````
```serihu
right: 花子
left: 太郎

< キャラクター名を登録すればフキダシ色が個別に設定できます
< 通常台詞のフォントは　アンチック体が漫画っぽくてオススメ
<<:weak 情けない声とかも設定できます……
( 思考中……
(( 心の叫び！

>:pop フォントは設定画面から設定できるよ♪
>:monologue 通常台詞も丸ゴシック体にすると雰囲気が変わるんだよな……
) 真面目な考え事をする時はアンチック体が良い
>>:strong うおお⌇⌇⌇⌇⌇突然ですがこれは「気合の雄叫び」ですッ！
)):horror 好きに使ってね……

right: 一郎
> 途中でキャラクターを　入れ替えることもできるぞ！
> デフォルトのフキダシの背景色や枠線の色もカスタマイズできます

# これはコメント行になります
# １行ずつしか書けないよ！

```
````
![alt text](<docs/Pasted image 20250213232721.png>)
### Properties

Specify the left and right character names.  
If a name registered in the characters list is specified, the character's color will be applied to the speech bubble.

| Properties  |           |
| ------ | --------- |
| left:  | Character name on the left |
| right: | Character name on the right |
 
As shown in Example, you can also change the position of a character during a character dialogue.

### prefix 
The prefix entered at the beginning of a line determines how the line is displayed.  
Be sure to include a single space after the prefix.  

| Prefix |          |
| --- | -------- |
| `<` | Dialogue on the left  |
| `>` | Dialogue on the right |
| `#` | Comment     |

#### Bubble shape

The dialogue prefix allows you to specify the shape of the speech bubble.

| 記号          |                |
| ----------- | -------------- |
| `<`or`>`    | Default     |
| `<<`or `>>` | Rough        |
| `(` or`)`   | Thought     |
| `((`or`))`  | Uni-flash |

![alt text](<docs/Pasted image 20250213234749.png>)

#### Typeface
 
You can change the typeface by using the prefix + `:` to specify the type.  
The typeface can be specified from the Settings tab.
 
The following typefaces are specified by default.  
They are not preinstalled fonts, so you must install your own typeface or change the typeface from the Settings tab.

| Type        | Typeface               | Download links                                                                                                    |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| none         | Shippori Antique | [Shippori Antique - Google Fonts](https://fonts.google.com/specimen/Shippori+Antique?query=Shippori+Antique) |
| :monologue | 源柔ゴシック           | [源柔ゴシック (げんじゅうゴシック) \| 自家製フォント工房](http://jikasei.me/font/genjyuu/)                                           |
| :pop       | Mochiy Pop One   | [Mochiy Pop One - Google Fonts](https://fonts.google.com/specimen/Mochiy+Pop+One)                            |
| :strong    | 源暎エムゴv2          | [【フリーフォント】源暎フォント ダウンロード - 御琥祢屋](https://okoneya.jp/font/download.html)                                       |
| :weak      | 851チカラヨワク        | [851チカラヨワク配布だす](https://pm85122.onamae.jp/851ch-yw.html)                                                     |
| :horror    | g_コミックホラー恐怖-教漢   | [g\_コミックホラー恐怖(R)-教漢版 \[よく訓練された素材屋\]](https://material.animehack.jp/font_gcomichorror.html)                   |

#####  ✍External characters

Half-width characters will be oriented horizontally.  
so when writing two `!` or `?`, it is recommended to use Unicode `‼` `⁇` `⁈` `⁉`.
Use `〰` or `⌇` to join long wavy lines.
 
If you have specified "Shippori Antique" or "GenEi Font", you can use this tool to copy external characters.  
[しっぽり明朝ほか 外字簡単入力ツール](https://donutland.jp/edl/shippori-copier/)  
[源暎フォント外字コピャー](https://donutland.jp/edl/genei-copier/)

## Settings

### General Settings

You can set the appearance and font of the speech bubble.  
Bubble Height and Comment Width must be in units.  
Enter the font-family name for the font name.

##### ✍How to identify the Font-family name.

It is easy to open Notepad and copy and paste the font name displayed in Format → Font.  
![alt text](<docs/Pasted image 20250213235635.png>)

### Character List
 
If you add a character to the Character list, you can specify the color of the speech bubble.


If the name specified in the property matches the name registered in the list, the color of the bubble will change.  
In the list, you can change the character's name, specify the bubble color, and remove the character.

#### Required Files
A special css file is required to use the character list feature.
1. manually create a folder named `skin` in Your Vault Name/.obsidian/plugins/manga-dialogue-render
2. store the template file [_color.tpl](https://github.com/kumocorn/manga-dialogue-render/releases/download/v1.0.1/_color.tpl) in the `skin` folder.
3. add a character to the character list, When you add a character to the character list, `color.css` will be created automatically. Now the color will be applied to speech bubbles. 👍️

## Many thanks!!

This plugin was created by a person who cannot read and write TypeScript with the help of chatGPT.  
Sorry, we may not be able to fix bugs!
