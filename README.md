# Obsidian Manga Dialogue Render

コードブロック内に記述されたキャラクターの会話をMangaスタイルで表示するプラグインです。
This plugin renders character dialogue written in codeblock in a manga-style.
![alt text](<docs/Pasted image 20250213232117.png>)
- キャラクターの台詞をフキダシ内に表示します。
	Character dialogue ("台詞(serihu)") is displayed in a speech bubble.
- 書体や吹き出しの形を変更することができます。
	You can change the font and speech bubble shape.
- キャラクターをリストに追加してフキダシの色をカスタムすることができます。
	You can add characters to a list and customize the speech bubble color.

漫画のプロット製作に視覚的なインスピレーションを与えることができると思います！
I hope this will give you visual inspiration for creating manga plots!

ごめんなさい。これは日本語向けのプラグインです。
横文字は既存の素晴らしいプラグインを使用してください！
Sorry, this is a plugin for Japanese language.
Please use existing great plugins for horizontal text!

## 使用法＿Usage

`serihu`コードブロック内に左右のキャラクター名を設定し、プレフィックスをつけて会話を書くだけです。
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
### プロパティ＿properties
左右のキャラクター名を指定します。
キャラクターリストに登録された名前が指定されると、フキダシにキャラクターカラーが反映されます。
Specify the left and right character names.
If a name registered in the characters list is specified, the character's color will be applied to the speech bubble.

| プロパティ  |           |
| ------ | --------- |
| left:  | 左のキャラクター名 |
| right: | 右のキャラクター名 |

Exampleにあるように、途中でキャラクターのポジションを変えることもできます。
As shown in Example, you can also change the position of a character during a character dialogue.

### 接頭辞＿prefix
行の初めに入力された記号によって、その行の表示方法を決めます。
接頭辞の後には必ず半角スペースを入れてください。
The prefix entered at the beginning of a line determines how the line is displayed.
Be sure to include a single space after the prefix.

| 記号  |          |
| --- | -------- |
| `<` | leftの台詞  |
| `>` | rightの台詞 |
| `#` | コメント     |
#### フキダシ形状＿bubble shape
台詞接頭辞でフキダシの形を指定できます。
The dialogue prefix allows you to specify the shape of the speech bubble.

| 記号          |                |
| ----------- | -------------- |
| `<`or`>`    | 通常＿Default     |
| `<<`or `>>` | 激＿Rough        |
| `(` or`)`   | 思考＿Thought     |
| `((`or`))`  | ウニフラ＿Uni-flash |
![[Pasted image 20250213234749.png]]
#### 書体＿typeface
接頭辞 +`:`でタイプを指定して書体を変更することが出来ます。
書体は設定画面から指定できます。
You can change the typeface by using the prefix + `:` to specify the type.
The typeface can be specified from the Settings tab.

デフォルトでは以下の書体が指定されています。
プリインストールフォントではないので、ユーザーが書体をインストールするか、設定画面から書体を変更してください。
The following typefaces are specified by default.
They are not preinstalled fonts, so you must install your own typeface or change the typeface from the Settings tab.

| タイプ        | 書体               | ダウンロードリンク                                                                                                    |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| なし         | Shippori Antique | [Shippori Antique - Google Fonts](https://fonts.google.com/specimen/Shippori+Antique?query=Shippori+Antique) |
| :monologue | 源柔ゴシック           | [源柔ゴシック (げんじゅうゴシック) \| 自家製フォント工房](http://jikasei.me/font/genjyuu/)                                           |
| :pop       | Mochiy Pop One   | [Mochiy Pop One - Google Fonts](https://fonts.google.com/specimen/Mochiy+Pop+One)                            |
| :strong    | 源暎エムゴv2          | [【フリーフォント】源暎フォント ダウンロード - 御琥祢屋](https://okoneya.jp/font/download.html)                                       |
| :weak      | 851チカラヨワク        | [851チカラヨワク配布だす](https://pm85122.onamae.jp/851ch-yw.html)                                                     |
| :horror    | g_コミックホラー恐怖-教漢   | [g\_コミックホラー恐怖(R)-教漢版 \[よく訓練された素材屋\]](https://material.animehack.jp/font_gcomichorror.html)                   |
#####  ✍外字＿external characters
半角文字は横向きになってしまうため、!や?を2つ繋げる場合はUnicodeの`‼` `⁇` `⁈` `⁉`を使用することを推奨します。
波線を繋げる場合は`〰` or `⌇`を使用してください。
Half-width characters are oriented horizontally, so characters such as ! and ? We recommend you to use Unicode `‼` `⁇` `⁈` `⁉` to join two `!
Use `〰` or `⌇` to join wavy lines.

「しっぽりアンチック」「源暎フォント」を指定している場合は以下のツールで特殊文字がコピーできます。
If you have specified "Shippori Antique" or "GenEi Font", you can use this tool to copy external characters.
[しっぽり明朝ほか 外字簡単入力ツール](https://donutland.jp/edl/shippori-copier/)
[源暎フォント外字コピャー](https://donutland.jp/edl/genei-copier/)
## 設定＿Settings
### General Settings
フキダシの見た目やフォントの設定ができます。
Bubble Height と Comment Width は単位をつけてください。
フォント名はFont-family名を入力してください。
You can set the appearance and font of the speech bubble.
Bubble Height and Comment Width must be in units.
Enter the font-family name for the font name.
##### ✍Font-family名の確認方法＿How to identify the Font-family name.
メモ帳を開いて 書式 → フォント で表示されるフォント名をコピー&ペーストすると簡単です。
It is easy to open Notepad and copy and paste the font name displayed in Format → Font.
![alt text](<docs/Pasted image 20250213235635.png>)
### Character List
キャラクターリストにキャラクターを追加するとフキダシ色の指定ができます。
If you add a character to the Character list, you can specify the color of the speech bubble.

プロパティで指定した名前がリストに登録されている名前と一致するとフキダシ色が変わります。
リストではキャラクター名の変更、フキダシ色の指定、キャラクターの削除ができます。
If the name specified in the property matches the name registered in the list, the color of the bubble will change.
In the list, you can change the character's name, specify the bubble color, and remove the character.

## ありがとうございます！！ Many thanks!!
このプラグインはTypeScriptの読み書きが出来ない人間がchatGPTの力を借りて作ったものです。
バグの修正などは対応できない場合がありますごめんなさい！
This plugin was created by a person who cannot read and write TypeScript with the help of chatGPT.
Sorry, we may not be able to fix bugs!