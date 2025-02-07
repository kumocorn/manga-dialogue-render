# Obsidian Manga Dialogue Plugin

Markdownでキャラクターの会話をMangaスタイルで表示するプラグインです。
This plugin displays character dialogue in a Manga style using Markdown.

既存のプラグインは素晴らしいものばかりですが、縦書き表示ができないのでプラグインを作成しました。
There are many great existing plugins, but I created this one because they don't support vertical text.

キャラクターの台詞をフキダシ内に表示します。
Character dialogue ("台詞(serihu)") is displayed in a speech bubble.
書体や吹き出しの形を変更することができます。
You can change the font and speech bubble shape.
キャラクターをリストに追加してフキダシの色をカスタムすることができます。
You can add characters to a list and customize the speech bubble color.

漫画のプロット製作に視覚的なインスピレーションを与えることができると思います！
I hope this will give you visual inspiration for creating manga plots!

ごめんなさい。これは日本語向けのプラグインです。
横文字は既存の素晴らしいプラグインを使用してください！
Sorry, this is a plugin for Japanese language.
Please use existing great plugins for horizontal text!

## 使用法＿Usage

コードブロックに会話を書くだけです。

````
```serihu
left: フリーザ
right: 悟空

>> ハァ…
>> ハァ…

< この　しつこいくたばりぞこないめ………
<< いいだろう!!!
<< こんどはこっぱみじんにしてやる　　　　　　　あの地球人のように!!!
# 気を溜めるフリーザ

> あの地球人のように？…
> クリリンのことか…
>>:strong クリリンのことか――――――――――――――――っ!!!!!!!
```
````
```serihu
left: フリーザ
right: 悟空

>> ハァ…
>> ハァ…

< この　しつこいくたばりぞこないめ………
<< いいだろう!!!
<< こんどはこっぱみじんにしてやる　　　　　　　あの地球人のように
# 気を溜めるフリーザ

> あの地球人のように？…
> クリリンのことか…
>>:strong クリリンのことか――――――――――――――――っ!!!!!!!

#以下テスト
left: 〰
right: ⌇

> あああ⌇⌇⌇⌇⌇⌇⌇‼⁈!!!
>:pop あああ⌇⌇⌇⌇⌇⌇⌇‼⁈!!!
>:strong あああ⌇⌇⌇⌇⌇⌇⌇‼⁈!!!
>:monologue あああ⌇⌇⌇⌇⌇⌇⌇‼⁈!!!
>:weak あああ⌇⌇⌇⌇⌇⌇⌇‼⁈!!!
>:horrer あああ⌇⌇⌇⌇⌇⌇⌇‼⁈!!!

< ああああ〰〰〰〰〰〰‼⁈!!!
<:pop ああああ〰〰〰〰〰〰‼⁈!!!
<:strong ああああ〰〰〰〰〰〰‼⁈!!!
<:monologue ああああ〰〰〰〰〰〰‼⁈!!!
<:weak ああああ〰〰〰〰〰〰‼⁈!!!
<:horrer ああああ〰〰〰〰〰〰‼⁈!!!
```
### プロパティ＿properties

| プロパティ |           |
| ----- | --------- |
| left  | 左のキャラクター名 |
| right | 右のキャラクター名 |



### 接頭辞-prefix
行の初めに入力された記号によって、その行の表示方法を決めます。
接頭辞の後には必ず半角スペースを入れてください。

| 記号  |          |
| --- | -------- |
| `<` | leftの台詞  |
| `>` | rightの台詞 |
| `#` | コメント     |
#### フキダシ形状＿bubble shape
台詞の接頭辞でフキダシの形を指定できます。

| 記号          |            |
| ----------- | ---------- |
| `<`or`>`    | 通常＿Default |
| `<<`or `>>` | 激＿Rough    |
| `(` or`)`   | 思考＿Thought |

#### 書体＿font-type
`<:strong`のように接頭辞にタイプを追加すると台詞の書体を変更することが出来ます。
適用される書体は設定画面から指定できます。
実際の原稿で使用しているローカルフォントを指定するのがベター。

デフォルトでは以下の書体が指定されています。
同人誌制作などにプリインストールフォントではないので、ユーザーが書体をインストールするか、設定画面から書体を変更してください。

| 型         | 書体     | フォント名 |
| --------- | ------ | ----- |
| monologue | 丸ゴシック体 |       |
| pop       | ポップ体   |       |
| strong    | 角ゴシック体 |       |
| weak      |        |       |
| horrer    | ホラー体   |       |
#####  外字＿external characters
!や?を2つ繋げる場合はUnicodeの`‼` `⁇` `⁈` `⁉`を使用してください。
波線を繋げる場合は`〰` or `⌇`を使用してください。

「しっぽり明朝」「源暎フォント」を指定している場合は以下のツールで特殊文字がコピーできます！
[しっぽり明朝ほか 外字簡単入力ツール](https://donutland.jp/edl/shippori-copier/)
[源暎フォント外字コピャー](https://donutland.jp/edl/genei-copier/)


## 設定＿Settings
### キャラクターリスト＿Character list
キャラクターリストにキャラクターを追加するとフキダシ色の指定ができます。

プロパティで指定した名前がリストに登録されている名前と一致するとフキダシ色が変わります。
リスト上でキャラクター名の変更、フキダシ色の指定、キャラクターの削除ができます。

## 小技＿Tips
### CSSスニペット
CSSスニペットを追加することでフキダシのスタイルをさらにカスタムすることができます。

#### GoogleFontsを使う
ローカルフォントではなく
漫画に使えるWebフォントがいくつかあります。

Shippori Antique
Mochiy Pop One
Zen Maru Gothic
Zen Kaku Gothic Antique
Yuji Boku