# 概要

「KURAGE_SemiAutoDungeon.js」はめんどくさいダンジョン作成を半自動化し，短時間で大量の自然なダンジョンを作ってくれます。

![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/BEFORE_AFTER.png)

また，屋外のマップも自動生成してくれます。

![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/TREE_デフォルト.jpg)

これを使うことで今までダンジョン作成に費やしていた時間を短縮でき，その分システムやシナリオに力を入れることができますよ！

# プロジェクトファイル
以下にプロジェクトファイルを公開しております。

https://1drv.ms/u/s!AtEcwaHTDUe7aSlGEKtysLIlgGg

# 使い方（ダンジョン作成編）

このプラグインの大まかな使い方は以下のとおりです。
1. プラグインを用意する。
2. 「素材マップ」「ダンジョンテンプレマップ」を作成する。
3. テストプレイを実行しプラグインコマンド「KURAGE_SemiAutoDungeon」を実行する。
4. dataフォルダにマップデータが作成されているので，既存のマップデータと置き換える。
5. RPGツクールMVのプロジェクトファイルを再読み込みして出来上がり！

使い方の詳細を以下に説明していきます。

## 1.プラグインの用意
このページの上部にある緑色のボタンをクリックしZIPファイルをダウンロードしてください。

ZIPファイルを解答し，「KURAGE_SemiAutoDungeon.js」をRPGツクールMVのプロジェクトのpluginフォルダへ，「__SwapMap.bat」をdataフォルダに保存してください。

（__SwapMap.batはWindowsを使用している方のみ利用可能です。）

RPGツクールMVを起動し，プラグインを読み込んでください（下図）。
![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/PLUGIN.png)

この時点でプラグインパラメータの設定は特に必要ありません。

## 2.「素材マップ」「ダンジョンテンプレマップ」の作成
「素材マップ」「ダンジョンテンプレマップ」の2種類のマップを作成します。

素材マップとダンジョンテンプレマップは，素材マップが親・ダンジョンテンプレマップが子となるようにマップツリーを構成してください（下図）。

![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/MAPTREE.png)

### 素材マップ
ダンジョンを構成する要素を並べた素材マップを作成します（下図）。
![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/SOZAI.png)

素材マップは以下の規格のとおり素材を配置してください。

Y座標　：　素材内容

0　　　：　「床」「壁」「天井」

1　　　：　通行可能でオートタイルで塗りつぶしするタイプの床（例：「床の苔」「床の汚れ」「毒の沼」など）

2　　　：　通行可能で床に置くタイプのオブジェクト（例：「砂利」「草」など）

3　　　：　通行不可能で床に置くタイプの1x1サイズのオブジェクト（例：「岩」「掘られた床」など）

4～5 　：　通行不可能で床に置くタイプの1x2サイズのオブジェクト（例：「大きな岩」「石像」など）

6　　　：　1x1サイズの壁の飾り（例：「壁の苔」など）

7～8 　：　1x2サイズの壁の飾り（例：「壁のツタ」など）

### ダンジョンテンプレマップ
通路のみで構成されるダンジョンテンプレマップを作成します（下図）。
![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/TEMPLATE.png)

上図にあるとおり，ダンジョンテンプレマップは以下の規格に則って作成してください。

1. 通路の幅は3マス以上
2. 通路と通路の間の空間は6マス以上
3. マップの最外周と通路の間のマージンは3マス以上（出入り口を除く）

### プラグインパラメータの設定
作成した素材マップのマップIDをプラグインパラメータ「ダンジョン素材マップID」に入力してください（下図）。
![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/PLUGIN_PARAMETER.png)

素材マップはコンマ区切りで複数入力することができます。

## 3.テストプレイ
どこでもよいのでマップにイベントを用意し，プラグインコマンド「KURAGE_SemiAutoDungeon」を呼び出してください（下図）。
![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/CALL_COMMAND.png)

テストプレイを実行し，F8キーを押してコンソール画面を開いてください。

プラグインコマンドを呼び出すとマップの生成が始まり，途中経過をコンソール画面に出力します（下図）。
![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/CONSOLE.png)

## 4.dataフォルダの操作
プラグインコマンドを実行することでdataフォルダ内に「_Map***.json」というファイルが作成されています。

これはダンジョンテンプレマップのデータであるMap***.jsonを元にプラグインが生成したマップです。

先頭のアンダーバーを取り除き，Map***.jsonとすることでRPGツクールMVで読み込むことができるようになります。

Windows環境であれば「__SwapMap.bat」をdataフォルダに保存しダブルクリックして実行することで，

全ての「_Map***.json」を「Map***.json」に置き換えてくれます。

（元のMap***.jsonは_Map***.jsonとして保存されます。

つまりファイル名のスワップを行っているわけです。）

## 5.プロジェクトファイルの再読み込み
Map***.jsonを置き換えたならば，RPGツクールMVの「プロジェクトを開く（Ctrl+o）→Game.rpgproject」でプロジェクトを開き直してください。

ダンジョンが自動生成されたものに置き換わっていると思います。

生成されたダンジョンを修正するもよし，そのまま使うもよし，ご自由にご使用ください。

# 使い方（屋外マップ作成編）

屋外マップの作成方法はダンジョンの作成方法と同じです。

ダンジョン生成と異なる点は以下のとおりです。

・「素材マップ」を用意し，「ダンジョンテンプレマップ」は空マップとする。
・「素材マップ」に崖や2×2サイズの木のタイルを用意する。

使い方の詳細を以下に説明していきます。

## 1.プラグインの用意
ダンジョン生成と同じです。

## 2.「素材マップ」「ダンジョンテンプレマップ」の作成
「素材マップ」「ダンジョンテンプレマップ」の2種類のマップを作成します。

素材マップとダンジョンテンプレマップは，素材マップが親・ダンジョンテンプレマップが子となるようにマップツリーを構成してください。

### 素材マップ
素材マップの規格はダンジョンとほぼ同じですが，Y座標9以上に屋外マップ専用のタイルが必要になります。

Y座標　：　素材内容

0　　　：　「床」「壁」「天井」

1　　　：　通行可能でオートタイルで塗りつぶしするタイプの床（例：「床の苔」「床の汚れ」「毒の沼」など）

2　　　：　通行可能で床に置くタイプのオブジェクト（例：「砂利」「草」など）

3　　　：　通行不可能で床に置くタイプの1x1サイズのオブジェクト（例：「岩」「掘られた床」など）

4～5 　：　通行不可能で床に置くタイプの1x2サイズのオブジェクト（例：「大きな岩」「石像」など）

6　　　：　1x1サイズの壁の飾り（例：「壁の苔」など）

7～8 　：　1x2サイズの壁の飾り（例：「壁のツタ」など）

9～　　：　崖の上，崖，2×2の木を下図のように配置してください。
![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/SOZAI_FIELD.png)

### ダンジョンテンプレマップ
素材マップの子マップとして空マップを用意してください。

### プラグインパラメータの設定
作成した素材マップのマップIDをプラグインパラメータ「屋外マップ素材マップID」に入力してください（下図）。
![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/PLUGIN_PARAMETER.png)

素材マップはコンマ区切りで複数入力することができます。

## 3.テストプレイ
## 4.dataフォルダの操作
## 5.プロジェクトファイルの再読み込み
ダンジョンの自動生成と同じです。

# オプション
マップデータのメモ欄にノートタグを記入することでオプションの指定ができます。

![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/OPTION.png)

ここでは良く使用するオプションについて説明します。

## 乱数のシード値
オプション<seed: 数字>を入力することで，乱数のシード値を変更できます。

シード値を変えることで，異なるダンジョン・屋外マップの作成が可能です。

できたマップが気に入らない場合，シード値を変更して再作成してみてください。

## オブジェクトの配置制限
ダンジョンテンプレマップのリージョン設定にてリージョンID「1」を配置すると，配置されたリージョン内に移動不可のオブジェクトを置かないようにできます。

これは主にダンジョンの出入り口付近に配置し，「別のマップから移動してきたあと移動不可オブジェクトの上に乗ってしまい動けなくなってしまう」という現象を避けるために使用します（下図）。

![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/REGION.png)

リージョンIDはオプションによって変更することもできます。


## 屋外マップ限定のオプション
### FIELD_TYPE
オプション<field_type: terrace>または<field_type: mix>と指定することで，
特別な屋外マップを作成可能です。
<field_type: terrace>では，地形が段々畑状になり北（画面上）に向かうほど高く，南（画面下）に向かうほど低い形なります。
terraceの場合の例を下図に示します。
![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/TERRACE.png)

<field_type: mix>では，基本を段々畑（北が高く，南が低い）とし，その上でランダムな高低差を追加します。
mixの場合の例を下図に示します。
![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/MIX.png)

### MAX_DEPTH
オプション<max_depth: 数字>を入力することで高低差の最大値を変更できます。

以下の図はmax_depthが4（デフォルト値）のときと6のときの結果の比較です。

![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/MAX_DEPTH比較.jpg)

### RELIEF
オプション<relief: 数字>を入力することで，高低差の「浮き彫り」の細かさを変更できます。

以下の図はmax_depthが20（デフォルト値）のときと10のときの結果の比較です。

![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/RELIEF_比較.jpg)

### TREE_DENSITY
オプション<tree_density: 数字>を入力することで，木々の密集度を変更できます。

以下の図はtree_densityが6（デフォルト値）のときと12のときの結果の比較です。

![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/TREE_DENS_比較.jpg)

### TREE_SIZE
オプション<tree_size: 数字>を入力することで，一つ一つ木々の集合の大きさを変更できます。

以下の図はtree_sizeが25（デフォルト値）のときと35のときの結果の比較です。

![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/TREE_SIZE_比較.jpg)

TREE_DENSITYとTREE_SIZEはそれぞれ変更してみて，自分の気に入る木の生い茂り方を探してみると楽しいと思います。

## ダンジョンマップ限定のオプション
### DUNGEON_SYMMETRY
<dungeon_symmery: on>とするとダンジョンを左右対称にします。
砦や塔などの人工物のダンジョンに使用することを想定しています。
<dungeon_symmery: on>の例を下図に示します。

![alt text](https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/SYMMETRY.png)

# ライセンス
本プラグインはMITライセンスです。

ヘッダー部に著作権表示とMITライセンスのURLを書いていただければ，

自由に改変，使用（非商用・商用・R-18何でも可）していただいて問題ありません。

（ですが，実際のところ配布物に含めることはないんじゃないかなぁ，と思っています。

テストプレイでダンジョン生成後，プラグインからは削除するんじゃないかと。

その場合，プラグインの使用報告，改造報告，著作権表示，ライセンス表記などは一切不要です。ご自由にご使用ください。）
