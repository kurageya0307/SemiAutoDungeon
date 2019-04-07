//=============================================================================
// KURAGE_SemiAutoDungeon.js
// Author    : KURAGE
// Date      : 2018/01/11
// Update    : 2018/10/31
// Version   : v1.2.0
//=============================================================================

//=============================================================================
/*:
 * @plugindesc v1.0.0 簡易に作成したマップから自然なダンジョンを生成します。
 * @author KURAGE
 *
 * @param ダンジョン素材マップID
 * @desc ダンジョンの素材を配置したマップのマップIDをコンマ区切りで指定します。スペースは無視されます。
 * 0を指定することはできません。
 * @default 1, 2, 3
 *
 * @param 屋外マップ素材マップID
 * @desc 屋外マップの素材を配置したマップのマップIDをコンマ区切りで指定します。スペースは無視されます。
 * 0を指定することはできません。
 * @default 4, 5, 6
 *
 * @param コンソール出力モード（ON/OFF)
 * @desc ONにした場合，生成したマップのJSONデータをコンソール出力します。
 * @default OFF
 *
 * @help 
 *
 *-----------------------------------------------------------------------------
 * Introduction
 *-----------------------------------------------------------------------------
 * ダンジョン半自動生成機能
 * 　素材を配置したマップと簡易に作成したマップから，
 * 　以下のアルゴリズムに基いて自然なダンジョンを生成します。
 * 　1.　角を削る。
 * 　2.　道を拡げ，ガタガタにする。
 * 　3.　通行可能なオブジェ・通行不可能なオブジェ・壁の飾りをランダムに配置する。
 * 　4.　影をつける。
 * 屋外マップ自動生成機能
 * 　フラクタル地形（パリンノイズ）を用いて高低差のあるマップを自動生成し，
 * 　素材を配置したマップの情報をもとに屋外マップを作成します。
 * 
 *-----------------------------------------------------------------------------
 * Usage
 *-----------------------------------------------------------------------------
 * ダンジョン半自動生成
 * 　以下の二種類のマップを作成してください。
 * 　1.　素材を配置したマップ
 * 　2.　通路を直線で適当につないだマップ
 *
 * 　1.のマップは以下の規格のとおり素材を配置してください。
 * 　Y座標　：　素材内容
 * 　0　　　：　「床」「壁」「天井」
 * 　1　　　：　通行可能でオートタイルで塗りつぶしするタイプの床（例：「床の苔」「床の汚れ」「毒の沼」など）
 * 　2　　　：　通行可能で床に置くタイプのオブジェクト（例：「砂利」「草」など）
 * 　3　　　：　通行不可能で床に置くタイプの1x1サイズのオブジェクト（例：「岩」「掘られた床」など）
 * 　4～5 　：　通行不可能で床に置くタイプの1x2サイズのオブジェクト（例：「大きな岩」「石像」など）
 * 　6　　　：　1x1サイズの壁の飾り（例：「壁の苔」など）
 * 　7～8 　：　1x2サイズの壁の飾り（例：「壁のツタ」など）
 *
 * 　2.のマップは通路を直線で迷路状に繋いでください。
 * 　【重要】通路の幅は３，通路と通路の間の何もない空間の幅は６以上を推奨します。
 *　　　        　　~~~~                                  ~~~~~~~~
 * 屋外マップ自動生成
 * 　以下の二種類のマップを作成してください。
 * 　1.　素材を配置したマップ
 * 　2.　素材マップと子の関係にある空マップ
 *
 * 　1.のマップは以下の規格のとおり素材を配置してください。
 * 　Y座標　：　素材内容
 * 　0　　　：　「床」(実は使ってません(；´∀｀)）
 * 　1　　　：　通行可能でオートタイルで塗りつぶしするタイプの床（例：「床の苔」「床の汚れ」「毒の沼」など）
 * 　2　　　：　通行可能で床に置くタイプのオブジェクト（例：「砂利」「草」など）
 * 　3　　　：　通行不可能で床に置くタイプの1x1サイズのオブジェクト（例：「岩」「掘られた床」など）
 * 　4～5 　：　通行不可能で床に置くタイプの1x2サイズのオブジェクト（例：「大きな岩」「石像」など）
 * 　6　　　：　1x1サイズの壁の飾り（例：「壁の苔」など）
 * 　7～8 　：　1x2サイズの壁の飾り（例：「壁のツタ」など）
 *   9～11　：　崖や縁，2×2サイズの木を規格通り配置してください。
 *   　　　　　 配置図は以下を参考にしてください。
 *　　　　　　　https://github.com/kurageya0307/SemiAutoDungeon/blob/pictures/SOZAI_FIELD.png
 *
 * テストプレイを行い，どこかのマップにて以下のプラグインコマンドを実行してください。
 * 「KURAGE_SemiAutoDungeon」
 * （F8キーを押してコンソール画面を開くとダンジョン生成の進行具合を確認できます。）
 *
 * dataフォルダに作成された「_Map***.json」をMap***.jsonにリネームしてください。
 * Windows環境の場合，同梱のバッチファイル「__SwapMap.bat」をダブルクリックすると
 * 全てのファイルが自動でリネームされます。
 *
 * RPGツクールMVの「プロジェクトを開く（Ctrl+O）→Game.rpgproject」で
 * 再度プロジェクトファイルを開き直すとマップデータが反映されます。
 *
 *-----------------------------------------------------------------------------
 * Options
 *-----------------------------------------------------------------------------
 * マップのメモ欄に以下のノートタグを記入することで，
 * オプションの設定をすることができます。
 *
 * <seed: 数字>
 * 　乱数のシード値を指定します。デフォルトではマップのマップIDがシード値になっています。
 *
 * <field_type系>
 *  <field_type: shield>（デフォルト）
 *  <field_type: terrace>
 *  <field_type: mix>
 * 　（屋外マップ限定）屋外マップの地形を指定します。
 * 　shieldでは地形が楯状地のようになり，等高線を引いた地図のように高い所・低い所の入り混じった形になります。
 * 　terraceでは地形が段々畑のようになり，北（画面上）に向かうほど高いようになります。
 * 　mixは基本を段々畑としshieldのようなランダムな高低差が追加された地形になります。
 *
 * <max_depth: 数字>　デフォルト値　4
 * 　（屋外マップ限定）高低差の最大値を指定します。
 *
 * <relief: 数字>　デフォルト値　20
 * 　（屋外マップ限定）高低差の彫りの深さ・周期を指定します。
 *   X・Yをそれぞれ指定可能であり，その場合relief_x，relief_yとタグを入力してください。
 *
 * <tree_density: 数字>　デフォルト値　6
 * 　（屋外マップ限定）木々の密集度を指定します。
 * 　この数字が大きいほど木々と木々の間の距離が大きくなります。
 *   X・Yをそれぞれ指定可能であり，その場合tree_density_x，tree_density_yとタグを入力してください。
 *
 * <tree_size: 数字>　デフォルト値　25
 * 　（屋外マップ限定）一つ一つの木々の集まりの大きさを指定します。
 * 　この数字が大きいほどある木々集合のサイズが大きくなります。
 *
 * <dungeon_symmetry: on>　デフォルト値　off
 * 　（ダンジョンマップ限定）ダンジョンを左右対称にします。
 * 　砦や塔など人工物のダンジョン作成時にお使いください。
 *
 * <add系>
 *  <add_all: off>
 *  <add_a_obj: off>
 *  <add_w_obj: off>
 *  <add_u_obj: off>
 *  <add_wall: off>
 *  <add_tree: off>
 * 　床・壁・天井以外のオブジェクトや壁飾り，木などを出力するかどうかを制御します。
 * 　デフォルトでは全て「出力する」となっています。
 * 　例えば，<add_all: off>とすると床・壁・天井のみを出力し，オブジェクト等は全て出力しません。
 * 　それぞれのオプションの意味は以下のようになっています。
 * 　　add_all　　：全てのオブジェクトの出力をoff
 * 　　add_a_obj　：オートタイルで塗りつぶしをするタイプの床の出力をoff　（aはautotileの略）
 * 　　add_w_obj　：通行可能で床に置くタイプのオブジェクトの出力をoff　　（wはwalkableの略）
 * 　　add_u_obj　：通行不可能のオブジェクトの出力をoff　　　　　　　　　（uはunwalkableの略）
 * 　　add_wall　 ：壁の飾りの出力をoff
 * 　　add_tree　 ：（屋外マップ限定）2×2の木の出力をoff
 *
 * <block系>
 *  <block_a_obj: 数字> デフォルト値 10
 *  <block_w_obj: 数字> デフォルト値  5
 *  <block_u_obj: 数字> デフォルト値 10
 *  <block_wall: 数字>  デフォルト値 10
 * 　オブジェクトなどはマップ全体を小さなサブ領域にわけ，サブ領域内に配置されるように実装されています。
 * 　（詳細はhttp://kurageya0307.hatenadiary.com/entry/2018/01/23/112017の6章を参照してください。）
 * 　block系のオプションではこの小さなサブ領域のサイズを指定できます。
 * 　また，全てのオプションがX・Yそれぞれ別々に指定可能です。その場合，タグをblock_a_obj_xなどとしてください。
 * 　おそらくはデフォルト値のままでよいと思います。
 *
 * <limit系>
 *  <limit_u_obj: 数字> デフォルト値 1
 *  <limit_a_obj: 数字> デフォルト値 2
 *  <limit_w_obj: 数字> デフォルト値 3
 *  <limit_wall: 数字>  デフォルト値 4
 *  <limit_tree: 数字>  デフォルト値 5
 * 　limit系で指定した数字のリージョンを設定した座標には該当するオブジェクトなどを設置しないようになります。
 * 　これもおそらくはデフォルト値のままご使用していただければよいかと思います。
 *
 *-----------------------------------------------------------------------------
 * License
 *-----------------------------------------------------------------------------
 * This plugin is released under the MIT License.
 * Copyright (c) 2018 Y.K
 * http://opensource.org/licenses/mit-license.php
 * 
 *-----------------------------------------------------------------------------
 * Acknowledgements
 *-----------------------------------------------------------------------------
 * このプラグインは以下のソースコードを流用しております。
 * ・SupponChangeTileId.js   ： 作成者　Suppon 氏
 * ・GraphicalDesignMode.js  ： 作成者　Triacontane 氏
 * ・perlin.js               ： 作成者　Joseph Gentle 氏
 * ・シード値つき乱数        ： 作成者　古都こと 氏
 * 素敵なプラグインを作成いただいた皆様に感謝いたします。
 *
 *-----------------------------------------------------------------------------
 * Others
 *-----------------------------------------------------------------------------
 * 
 * v1.0.0 - 2018/01/11 : 新規作成
 * v1.1.0 - 2018/02/18 : 屋外マップの作成機能の追加
 * v1.2.0 - 2018/10/07 : コンソール出力の追加
 * v1.2.1 - 2018/10/31 : 屋外マップの仕様変更
 * 
 *-----------------------------------------------------------------------------
*/
//=============================================================================

"use strict";

var Imported = Imported || {};
Imported["KURAGE_SemiAutoDungeon"] = "1.0.1";

var KURAGE = KURAGE || {};
KURAGE.SemiAutoDungeon = {};

(function($) {
  //-----------------------------------------------------------------------------
  // Global variables
  //
  $.params = PluginManager.parameters('KURAGE_SemiAutoDungeon');
  $.dungeon_parent_ids = $.params['ダンジョン素材マップID'].split(",").map(function(v) {return Number(v);} );
  if($.dungeon_parent_ids.length===1 && $.dungeon_parent_ids[0]===0){
    $.dungeon_parent_ids = [];
  }
//console.log($.dungeon_parent_ids)
  $.field_parent_ids = $.params['屋外マップ素材マップID'].split(",").map(function(v) {return Number(v);} );
  if($.field_parent_ids.length===1 && $.field_parent_ids[0]===0){
    $.field_parent_ids = [];
  }
//console.log($.field_parent_ids)
  var tmp = $.params['コンソール出力モード'];
  if(tmp === "ON"){
    $.console_out = true;
  } else {
    $.console_out = false;
  }
  $.console_stopped = false;
  
  $.random = null;
  $.dungeon_and_parent_pair = [];
  $.field_and_parent_pair = [];


  //-----------------------------------------------------------------------------
  // Functions from "perlin.js".
  // 

/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *

ISC License

Copyright (c) 2013, Joseph Gentle

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.

 */


  var noise = {};

  function Grad(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }
  
  Grad.prototype.dot2 = function(x, y) {
    return this.x*x + this.y*y;
  };

  Grad.prototype.dot3 = function(x, y, z) {
    return this.x*x + this.y*y + this.z*z;
  };

  var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
               new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
               new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];

  var p = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  // To remove the need for index wrapping, double the permutation table length
  var perm = new Array(512);
  var gradP = new Array(512);

  // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  noise.seed = function(seed) {
    if(seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if(seed < 256) {
      seed |= seed << 8;
    }

    for(var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ (seed & 255);
      } else {
        v = p[i] ^ ((seed>>8) & 255);
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };

  noise.seed(0);

  /*
  for(var i=0; i<256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
  }*/

  // Skewing and unskewing factors for 2, 3, and 4 dimensions
  var F2 = 0.5*(Math.sqrt(3)-1);
  var G2 = (3-Math.sqrt(3))/6;

  var F3 = 1/3;
  var G3 = 1/6;

  // 2D simplex noise
  noise.simplex2 = function(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin)*F2; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var t = (i+j)*G2;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1=1; j1=0;
    } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1=0; j1=1;
    }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1 + 2 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    i &= 255;
    j &= 255;
    var gi0 = gradP[i+perm[j]];
    var gi1 = gradP[i+i1+perm[j+j1]];
    var gi2 = gradP[i+1+perm[j+1]];
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0*x0-y0*y0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1*x1-y1*y1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }
    var t2 = 0.5 - x2*x2-y2*y2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70 * (n0 + n1 + n2);
  };

  // 3D simplex noise
  noise.simplex3 = function(xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin+zin)*F3; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var k = Math.floor(zin+s);

    var t = (i+j+k)*G3;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    var z0 = zin-k+t;

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if(x0 >= y0) {
      if(y0 >= z0)      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if(x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else              { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if(y0 < z0)      { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if(x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else             { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;

    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;

    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;

    // Work out the hashed gradient indices of the four simplex corners
    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i+   perm[j+   perm[k   ]]];
    var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
    var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
    var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];

    // Calculate the contribution from the four corners
    var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }
    var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }
    var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if(t3<0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3);

  };

  // ##### Perlin noise stuff

  function fade(t) {
    return t*t*t*(t*(t*6-15)+10);
  }

  function lerp(a, b, t) {
    return (1-t)*a + t*b;
  }

  // 2D Perlin Noise
  noise.perlin2 = function(x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X; y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255;

    // Calculate noise contributions from each of the four corners
    var n00 = gradP[X+perm[Y]].dot2(x, y);
    var n01 = gradP[X+perm[Y+1]].dot2(x, y-1);
    var n10 = gradP[X+1+perm[Y]].dot2(x-1, y);
    var n11 = gradP[X+1+perm[Y+1]].dot2(x-1, y-1);

    // Compute the fade curve value for x
    var u = fade(x);

    // Interpolate the four results
    return lerp(
        lerp(n00, n10, u),
        lerp(n01, n11, u),
       fade(y));
  };

  // 3D Perlin Noise
  noise.perlin3 = function(x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X; y = y - Y; z = z - Z;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255; Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
    var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
    var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
    var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
    var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
    var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
    var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
    var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);

    // Compute the fade curve value for x, y, z
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);

    // Interpolate
    return lerp(
        lerp(
          lerp(n000, n100, u),
          lerp(n001, n101, u), w),
        lerp(
          lerp(n010, n110, u),
          lerp(n011, n111, u), w),
       v);
  };


  //
  // Functions from "perlin.js".
  //-----------------------------------------------------------------------------


  //-----------------------------------------------------------------------------
  // Functions from "SupponChangeTileId.js". Thank you, Mr./Ms. Suppon!
  //
    var AutoTilePattern = [
        [1, 1, 1,
         1, 1, 1,
         1, 1, 1],//0
        [0, 1, 1,
         1, 1, 1,
         1, 1, 1],//1
        [1, 1, 0,
         1, 1, 1,
         1, 1, 1],//2
        [0, 1, 0,
         1, 1, 1,
         1, 1, 1],//3
        [1, 1, 1,
         1, 1, 1,
         1, 1, 0],//4
        [0, 1, 1,
         1, 1, 1,
         1, 1, 0],//5
        [1, 1, 0,
         1, 1, 1,
         1, 1, 0],//6
        [0, 1, 0,
         1, 1, 1,
         1, 1, 0],//7
        [1, 1, 1,
         1, 1, 1,
         0, 1, 1],//8
        [0, 1, 1,
         1, 1, 1,
         0, 1, 1],//9
        [1, 1, 0,
         1, 1, 1,
         0, 1, 1],//10
        [0, 1, 0,
         1, 1, 1,
         0, 1, 1],//11
        [1, 1, 1,
         1, 1, 1,
         0, 1, 0],//12
        [0, 1, 1,
         1, 1, 1,
         0, 1, 0],//13
        [1, 1, 0,
         1, 1, 1,
         0, 1, 0],//14
        [0, 1, 0,
         1, 1, 1,
         0, 1, 0],//15
        [0, 1, 1,
         0, 1, 1,
         0, 1, 1],//16
        [0, 1, 0,
         0, 1, 1,
         0, 1, 1],//17
        [0, 1, 1,
         0, 1, 1,
         0, 1, 0],//18
        [0, 1, 0,
         0, 1, 1,
         0, 1, 0],//19
        [0, 0, 0,
         1, 1, 1,
         1, 1, 1],//20
        [0, 0, 0,
         1, 1, 1,
         1, 1, 0],//21
        [0, 0, 0,
         1, 1, 1,
         0, 1, 1],//22
        [0, 0, 0,
         1, 1, 1,
         0, 1, 0],//23
        [1, 1, 0,
         1, 1, 0,
         1, 1, 0],//24
        [1, 1, 0,
         1, 1, 0,
         0, 1, 0],//25
        [0, 1, 0,
         1, 1, 0,
         1, 1, 0],//26
        [0, 1, 0,
         1, 1, 0,
         0, 1, 0],//27
        [1, 1, 1,
         1, 1, 1,
         0, 0, 0],//28
        [0, 1, 1,
         1, 1, 1,
         0, 0, 0],//29
        [1, 1, 0,
         1, 1, 1,
         0, 0, 0],//30
        [0, 1, 0,
         1, 1, 1,
         0, 0, 0],//31
        [0, 1, 0,
         0, 1, 0,
         0, 1, 0],//32
        [0, 0, 0,
         1, 1, 1,
         0, 0, 0],//33
        [0, 0, 0,
         0, 1, 1,
         0, 1, 1],//34
        [0, 0, 0,
         0, 1, 1,
         0, 1, 0],//35
        [0, 0, 0,
         1, 1, 0,
         1, 1, 0],//36
        [0, 0, 0,
         1, 1, 0,
         0, 1, 0],//37
        [1, 1, 0,
         1, 1, 0,
         0, 0, 0],//38
        [0, 1, 0,
         1, 1, 0,
         0, 0, 0],//39
        [0, 1, 1,
         0, 1, 1,
         0, 0, 0],//40
        [0, 1, 0,
         0, 1, 1,
         0, 0, 0],//41
        [0, 0, 0,
         0, 1, 0,
         0, 1, 0],//42
        [0, 0, 0,
         0, 1, 1,
         0, 0, 0],//43
        [0, 1, 0,
         0, 1, 0,
         0, 0, 0],//44
        [0, 0, 0,
         1, 1, 0,
         0, 0, 0],//45
        [0, 0, 0,
         0, 1, 0,
         0, 0, 0]//46
    ];
    
    var AutoTilePattern2 = [
        [0, 1, 0,
         1, 1, 1,
         0, 1, 0],//0
        [0, 1, 0,
         0, 1, 1,
         0, 1, 0],//1
        [0, 0, 0,
         1, 1, 1,
         0, 1, 0],//2
        [0, 0, 0,
         0, 1, 1,
         0, 1, 0],//3
        [0, 1, 0,
         1, 1, 0,
         0, 1, 0],//4
        [0, 1, 0,
         0, 1, 0,
         0, 1, 0],//5
        [0, 0, 0,
         1, 1, 0,
         0, 1, 0],//6
        [0, 0, 0,
         0, 1, 0,
         0, 1, 0],//7
        [0, 1, 0,
         1, 1, 1,
         0, 0, 0],//8
        [0, 1, 0,
         0, 1, 1,
         0, 0, 0],//9
        [0, 0, 0,
         1, 1, 1,
         0, 0, 0],//10
        [0, 0, 0,
         0, 1, 1,
         0, 0, 0],//11
        [0, 1, 0,
         1, 1, 0,
         0, 0, 0],//12
        [0, 1, 0,
         0, 1, 0,
         0, 0, 0],//13
        [0, 0, 0,
         1, 1, 0,
         0, 0, 0],//14
        [0, 0, 0,
         0, 1, 0,
         0, 0, 0],//15
        [0, 0, 0,
         0, 0, 0,
         0, 0, 0]//16
    ];
    var AutoTilePattern3 = [
        [0, 0, 0,
         1, 1, 1,
         0, 0, 0],//0
        [0, 0, 0,
         0, 1, 1,
         0, 0, 0],//1
        [0, 0, 0,
         1, 1, 0,
         0, 0, 0],//2
        [0, 0, 0,
         0, 1, 0,
         0, 0, 0]//3
    ]

    $.applySupponCTI = function(args, sender){
        var mode = null;
        switch (args[0]) {
        case 'add':
          mode = 0;
          break;
        case 'change':
          mode = 1;
          break;
        case 'auto':
          mode = 2;
          break;
        case 'autoadd':
          mode = 3;
          break;
        }
        var id = Number(args[1]);
//        var s = Number(args[2]);//送り元のマップID
        var x1 = Number(args[2]);
        var y1 = Number(args[3]);
        var w = Number(args[4]);
        var h = Number(args[5]);
//        var d = Number(args[6]);//送り先のマップID
        var x2 = Number(args[6]);
        var y2 = Number(args[7]);
        var width = target_data_map.width;
        var height = target_data_map.height;
        var width0 = sender.width;
        var height0 = sender.height;
        var autoAdj = 0;
        for (var i=0; i<h; i++){
            if (0>y2+i || y2+i >= height){continue};
            for (var j=0; j<w; j++){
                if (0>x2+j || x2+j >= width){continue};
                var z3=3;
                if(target_data_map.data[(z3 * height + (y2+i)) * width + (x2+j)] != 0) {
                  var z2=2;
                  target_data_map.data[(z2 * height + (y2+i)) * width + (x2+j)] = target_data_map.data[(z3 * height + (y2+i)) * width + (x2+j)];
                }
                for (var z=0; z<6; z++){
                    var id0 = sender.data[(z * height0 + (y1+i)) * width0 + (x1+j)];
                    var id1 = target_data_map.data[(z * height + (y2+i)) * width + (x2+j)];
                    var id2 = sender.data[(0 * height0 + (y1+i)) * width0 + (x1+j)];
                    var isWall = 4351<id2 && id2<8192;
                    //if ($gameMap.tileset().mode==0 && id0 == 2720) {continue};
                    
                    var c = ( mode == 0 && id0 != 0 || mode == 1 || mode == 2);
                    if( c || (z==4 && isWall)){
                        target_data_map.data[(z * height + (y2+i)) * width + (x2+j)] =
                            sender.data[(z * height0 + (y1+i)) * width0 + (x1+j)];
                    }
                    if( mode == 3 ) {
                        if(target_data_map.data[(z * height + (y2+i)) * width + (x2+j)] != 0 &&
                            sender.data[(z * height0 + (y1+i)) * width0 + (x1+j)] != 0) {
                          target_data_map.data[(z * height + (y2+i)) * width + (x2+j)] =
                              sender.data[(z * height0 + (y1+i)) * width0 + (x1+j)];
                        }
                        if(target_data_map.data[(z * height + (y2+i)) * width + (x2+j)] == 0) {
                          target_data_map.data[(z * height + (y2+i)) * width + (x2+j)] =
                              sender.data[(z * height0 + (y1+i)) * width0 + (x1+j)];
                        }
                    }
                    if (mode >= 2 && (z == 0||z ==1)){
                        this.refreshAutoTiles(x2+j, y2+i, z);
                    }
                   
                }
            }
        }
        SceneManager._scene._spriteset._tilemap.refresh();
    }
    
    $.refreshAutoTiles = function(x, y, z){
        for (var i=-1; i<2; i++){
            for (var j=-1; j<2; j++){
                if(x+j<0) continue;
                if(y+i<0) continue;
                if(x+j>=target_data_map.width) continue;
                if(y+i>=target_data_map.height) continue;
                this.refreshAutoTile(x+j, y+i, z);
            }
        }
    }
    
    $.refreshAutoTile = function(x, y, z){
        var match = [];
        var width = target_data_map.width;
        var height = target_data_map.height;
        //var centerId = $gameMap.tileId(x, y, z);
        var index = (z*height + y)*width + x;
        var centerId = target_data_map.data[index];
        var centerKind = Tilemap.getAutotileKind(centerId);
        for (var i=-1; i<2; i++){
            for (var j=-1; j<2; j++){
                //var tileId = $gameMap.tileId(x+j, y+i, z);
                var index2 = (z*height + (y+i))*width + (x+j);
                var tileId = target_data_map.data[index2];
                var kind = Tilemap.getAutotileKind(tileId)
                    //if (!$gameMap.isValid(x+j,y+i)){
                if( (x+j<0) ||
                    (y+i<0) ||
                    (x+j>=target_data_map.width) ||
                    (y+i>=target_data_map.height) ){
                    match.push(1)
                }
                else if (i!=0 && Tilemap.isWaterTile(centerId) && Tilemap.isWaterfallTile(tileId)){
                    match.push(1);
                } else {
                    match.push(Tilemap.isSameKindTile(centerId,tileId) ? 1 : 0)
                }
            }
        }
        if (Tilemap.isFloorTypeAutotile(centerId)){
            var shape = this.getShapeFloorType(match);
        } else if (Tilemap.isWallTile(centerId) || Tilemap.isRoofTile(centerId)){
            var shape = this.getShapeWallTile(match);
        } else {
            var shape = this.getShapeWaterfall(match);
        }
        var newId = Tilemap.makeAutotileId(centerKind, shape);
        if(centerKind >= 0){
            target_data_map.data[(z * height + y) * width + x] = newId;
        }
        
        
    }
    
    $.getShapeFloorType = function(match){
        if (match[1]==0){
            match[0] = 0 ; match[2] = 0;
        }
        if (match[3]==0){
            match[0] = 0 ; match[6] = 0;
        }
        if (match[5]==0){
            match[2] = 0 ; match[8] = 0;
        }
        if (match[7]==0){
            match[6] = 0 ; match[8] = 0;
        }
        return AutoTilePattern.indexOfArray(match);
    }
    
    $.getShapeWallTile = function(match){
        match[0] = 0;
        match[2] = 0;
        match[6] = 0;
        match[8] = 0;
        return AutoTilePattern2.indexOfArray(match);
    }
    
    $.getShapeWaterfall = function(match){
        match[0] = 0;
        match[1] = 0;
        match[2] = 0;
        match[6] = 0;
        match[7] = 0;
        match[8] = 0;
        return AutoTilePattern3.indexOfArray(match);
    }
    
    Array.prototype.indexOfArray = function(element){
        for (var i=0; i<this.length; i++){
            if (this[i].equals(element)){
                return i;
            }
        }
        return -1;
    }

    Tilemap.isWallSideTile = function(tileId) {
        return (this.isTileA3(tileId) || this.isTileA4(tileId)) &&
                this.getAutotileKind(tileId) % 16 >= 8;
    };
 //
 // Functions from "SupponChangeTileId.js".
 //-----------------------------------------------------------------------------
    
 //-----------------------------------------------------------------------------
 // Functions from "GraphicalDesignMode.js". Thank you, Mr./Ms. Triacontane
 //
 /*
        StorageManager.saveToLocalDataFilePlain = function(fileName, json) {
            var data = json;
            var fs = require('fs');
            var dirPath = this.localDataFileDirectoryPath();
            var filePath = dirPath + fileName;
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
            fs.writeFileSync(filePath, data);
        };
        */

        //=============================================================================
        // StorageManager
        //  ウィンドウポジションをjson形式で保存する処理を追加定義します。
        //=============================================================================
        StorageManager.saveToLocalDataFile = function(fileName, json) {
            var data = JSON.stringify(json);
            var fs = require('fs');
            var dirPath = this.localDataFileDirectoryPath();
            var filePath = dirPath + fileName;
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
            fs.writeFileSync(filePath, data);

        };

        StorageManager.localDataFileDirectoryPath = function() {
            var path = require('path');
            var base = path.dirname(process.mainModule.filename);
            return path.join(base, 'data/');
        };
 //
 // Functions from "GraphicalDesignMode.js". Thank you, Mr./Ms. Triacontane
 //-----------------------------------------------------------------------------

  //-----------------------------------------------------------------------------
  // Class for random number with seed
  // Ref. https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/
  class Random {
    //initialize: function(seed) {
    constructor(seed) {
      this.x = 123456789;
      this.y = 362436069;
      this.z = 521288629;
      this.w = seed;
    }
    
    // XorShift
    next() {
      var t;
   
      t = this.x ^ (this.x << 11);
      this.x = this.y; this.y = this.z; this.z = this.w;
      return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8)); 
    }
    
    // random number between min and max.
    nextInt(min, max) {
      const r = Math.abs(this.next());
      return min + (r % (max + 1 - min));
    }
  }

  //-----------------------------------------------------------------------------
  // Function for reading notetag
  //
  function readNoteTag(note, mode) {
    let option = {};
    // set defaults
    option["SEED"] = undefined;

    option["ADD_A_OBJ"] = true;
    option["ADD_W_OBJ"] = true;
    option["ADD_U_OBJ"] = true;
    option["ADD_WALL"] = true;
    option["ADD_TREE"] = true;

    option["BLOCK_A_OBJ_X"] = 10;
    option["BLOCK_A_OBJ_Y"] = 10;
    option["BLOCK_W_OBJ_X"] = 5;
    option["BLOCK_W_OBJ_Y"] = 5;
    option["BLOCK_U_OBJ_X"] = 10;
    option["BLOCK_U_OBJ_Y"] = 10;
    option["BLOCK_WALL_X"] = 10;
    option["BLOCK_WALL_Y"] = 10;

    option["LIMIT_U_OBJ"] = 1;
    option["LIMIT_A_OBJ"] = 2;
    option["LIMIT_W_OBJ"] = 3;
    option["LIMIT_WALL"]  = 4;
    option["LIMIT_TREE"]  = 5;

    option["SHIELD_MAX_DEPTH"]  = 4;
    option["SHIELD_RELIEF_X"]   = 20;
    option["SHIELD_RELIEF_Y"]   = 20;
    option["TERRACE_MAX_DEPTH"] = 4;
    option["TERRACE_RELIEF_X"]  = 10;
    option["TERRACE_RELIEF_Y"]  = 10;

    option["TREE_DENSITY_X"]  = 6;
    option["TREE_DENSITY_Y"]  = 6;
    option["TREE_SIZE"]       = 25;

    option["DUNGEON_SYMMETRY"] = false;

    option["FIELD_TYPE"] = "shield";
    option["TERRACE_DEFORM"] = 8;

    let notedata = note.split(/[\r\n]+/);
    for (let i=0; i<notedata.length; i++) {
      let line = notedata[i];
      if (line.match(/<SEED:[ ]*(\d+)>/i))    { option["SEED"]  = parseInt(RegExp.$1); }

      if (line.match(/<ADD_ALL:[ ]*(?:OFF|FALSE)>/i)) { 
        option["ADD_A_OBJ"] = false;
        option["ADD_W_OBJ"] = false;
        option["ADD_U_OBJ"] = false;
        option["ADD_WALL"] = false;
        option["ADD_TREE"] = false;
      }
      if (line.match(/<ADD_A_OBJ:[ ]*(?:OFF|FALSE)>/i)) { option["ADD_A_OBJ"] = false;}
      if (line.match(/<ADD_W_OBJ:[ ]*(?:OFF|FALSE)>/i)) { option["ADD_W_OBJ"] = false;}
      if (line.match(/<ADD_WALL:[ ]*(?:OFF|FALSE)>/i))  { option["ADD_WALL"]  = false;}
      if (line.match(/<ADD_U_OBJ:[ ]*(?:OFF|FALSE)>/i)) { option["ADD_U_OBJ"] = false;}
      if (line.match(/<ADD_TREE:[ ]*(?:OFF|FALSE)>/i))  { option["ADD_TREE"]  = false;}

      if (line.match(/<BLOCK_A_OBJ:[ ]*(\d+)>/i))    { option["BLOCK_A_OBJ_X"]  = parseInt(RegExp.$1); option["BLOCK_A_OBJ_Y"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_A_OBJ_X:[ ]*(\d+)>/i))  { option["BLOCK_A_OBJ_X"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_A_OBJ_Y:[ ]*(\d+)>/i))  { option["BLOCK_A_OBJ_Y"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_W_OBJ:[ ]*(\d+)>/i))    { option["BLOCK_W_OBJ_X"]  = parseInt(RegExp.$1); option["BLOCK_W_OBJ_Y"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_W_OBJ_X:[ ]*(\d+)>/i))  { option["BLOCK_W_OBJ_X"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_W_OBJ_Y:[ ]*(\d+)>/i))  { option["BLOCK_W_OBJ_Y"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_U_OBJ:[ ]*(\d+)>/i))    { option["BLOCK_U_OBJ_X"]  = parseInt(RegExp.$1); option["BLOCK_U_OBJ_Y"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_U_OBJ_X:[ ]*(\d+)>/i))  { option["BLOCK_U_OBJ_X"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_U_OBJ_Y:[ ]*(\d+)>/i))  { option["BLOCK_U_OBJ_Y"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_WALL:[ ]*(\d+)>/i))     { option["BLOCK_WALL_X"]  = parseInt(RegExp.$1); option["BLOCK_WALL_Y"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_WALL_X:[ ]*(\d+)>/i))   { option["BLOCK_WALL_X"]  = parseInt(RegExp.$1);}
      if (line.match(/<BLOCK_WALL_Y:[ ]*(\d+)>/i))   { option["BLOCK_WALL_Y"]  = parseInt(RegExp.$1);}

      if (line.match(/<LIMIT_A_OBJ:[ ]*(\d+)>/i))  { option["LIMIT_A_OBJ"]  = parseInt(RegExp.$1);}
      if (line.match(/<LIMIT_W_OBJ:[ ]*(\d+)>/i))  { option["LIMIT_W_OBJ"]  = parseInt(RegExp.$1);}
      if (line.match(/<LIMIT_U_OBJ:[ ]*(\d+)>/i))  { option["LIMIT_U_OBJ"]  = parseInt(RegExp.$1);}
      if (line.match(/<LIMIT_WALL:[ ]*(\d+)>/i))   { option["LIMIT_WALL"]  = parseInt(RegExp.$1);}
      if (line.match(/<LIMIT_TREE:[ ]*(\d+)>/i))   { option["LIMIT_TREE"]  = parseInt(RegExp.$1);}

      if (line.match(/<RELIEF:[ ]*(\d+)>/i)){
        option["SHIELD_RELIEF_X"]  = parseInt(RegExp.$1);
        option["SHIELD_RELIEF_Y"]  = parseInt(RegExp.$1);
        option["TERRACE_RELIEF_X"] = parseInt(RegExp.$1);
        option["TERRACE_RELIEF_Y"] = parseInt(RegExp.$1);
      }
      if (line.match(/<RELIEF_X:[ ]*(\d+)>/i)){
        option["SHIELD_RELIEF_X"]  = parseInt(RegExp.$1);
        option["TERRACE_RELIEF_X"] = parseInt(RegExp.$1);
      }
      if (line.match(/<RELIEF_Y:[ ]*(\d+)>/i)){
        option["SHIELD_RELIEF_Y"]  = parseInt(RegExp.$1);
        option["TERRACE_RELIEF_Y"] = parseInt(RegExp.$1);
      }
      if (line.match(/<SHIELD_RELIEF:[ ]*(\d+)>/i)){
        option["SHIELD_RELIEF_X"]  = parseInt(RegExp.$1);
        option["SHIELD_RELIEF_Y"]  = parseInt(RegExp.$1);
      }
      if (line.match(/<SHIELD_RELIEF_X:[ ]*(\d+)>/i)){option["SHIELD_RELIEF_X"]  = parseInt(RegExp.$1);}
      if (line.match(/<SHIELD_RELIEF_Y:[ ]*(\d+)>/i)){option["SHIELD_RELIEF_Y"]  = parseInt(RegExp.$1);}
      if (line.match(/<TERRACE_RELIEF:[ ]*(\d+)>/i)){
        option["TERRACE_RELIEF_X"] = parseInt(RegExp.$1);
        option["TERRACE_RELIEF_Y"] = parseInt(RegExp.$1);
      }
      if (line.match(/<TERRACE_RELIEF_X:[ ]*(\d+)>/i)){option["TERRACE_RELIEF_X"] = parseInt(RegExp.$1);}
      if (line.match(/<TERRACE_RELIEF_Y:[ ]*(\d+)>/i)){option["TERRACE_RELIEF_Y"] = parseInt(RegExp.$1);}
      if (line.match(/<MAX_DEPTH:[ ]*(\d+)>/i))  { option["SHIELD_MAX_DEPTH"] = option["TERRACE_MAX_DEPTH"] = parseInt(RegExp.$1);}
      if (line.match(/<SHIELD_MAX_DEPTH:[ ]*(\d+)>/i))  { option["SHIELD_MAX_DEPTH"] = parseInt(RegExp.$1);}
      if (line.match(/<TERRACE_MAX_DEPTH:[ ]*(\d+)>/i)) { option["TERRACE_MAX_DEPTH"] = parseInt(RegExp.$1);}

      if (line.match(/<TREE_DENSITY:[ ]*(\d+)>/i))     { option["TREE_DENSITY_X"]  = parseInt(RegExp.$1); option["TREE_DENSITY_Y"]  = parseInt(RegExp.$1);}
      if (line.match(/<TREE_DENSITY_X:[ ]*(\d+)>/i))   { option["TREE_DENSITY_X"]  = parseInt(RegExp.$1);}
      if (line.match(/<TREE_DENSITY_Y:[ ]*(\d+)>/i))   { option["TREE_DENSITY_Y"]  = parseInt(RegExp.$1);}
      if (line.match(/<TREE_SIZE:[ ]*(\d+)>/i))        { option["TREE_SIZE"] = parseInt(RegExp.$1);}

      if (line.match(/<DUNGEON_SYMMETRY:[ ]*(?:ON|TRUE)>/i))  { option["DUNGEON_SYMMETRY"]  = true;}

      if (line.match(/<FIELD_TYPE:[ ]*(?:TERRACE)>/i)) { option["FIELD_TYPE"]  = "terrace";}
      if (line.match(/<FIELD_TYPE:[ ]*(?:MIX)>/i))     { option["FIELD_TYPE"]  = "mix";}
      if (line.match(/<TERRACE_DEFORM:[ ]*(\d+)>/i))   { option["TERRACE_DEFORM"] = parseInt(RegExp.$1);}
    }
    return option;
  };


  //-----------------------------------------------------------------------------
  // Plugin commands
  //
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    args = args.filter(function(n){ // <- args.compact! in ruby
      return n!=='';
    });
    if (command == "KURAGE_SemiAutoDungeon") {
      $gameMap.loadMapInfosOn();
    }
  };
 
  var _Game_Temp_initialize = Game_Temp.prototype.initialize
  Game_Temp.prototype.initialize = function() {
    _Game_Temp_initialize.call(this);
    this.loadAtOnce = true;
  };
  
  var _Game_Map_initialize = Game_Map.prototype.initialize;
  Game_Map.prototype.initialize = function() {
    _Game_Map_initialize.call(this);
    this.load_map_infos = false;
  };
 
  Game_Map.prototype.loadMapInfosOn = function(){
    this.load_map_infos = true;
  };
 
  var _Game_Map_update = Game_Map.prototype.update;
  Game_Map.prototype.update = function(sceneActive) {
    if(this.load_map_infos){
      this.updateForMapInfoDataLoad();
    } else if($.dungeon_and_parent_pair.length > 0){
      if($.console_out && $.console_stopped) {
        if( Input.isPressed("ok") ){
          this.updateForCreateDungeon();
        }
      } else {
        this.updateForCreateDungeon();
        //console.log($.dungeon_and_parent_pair[0]);
      }
    } else if($.field_and_parent_pair.length > 0){
      if($.console_out && $.console_stopped) {
        if( Input.isPressed("ok") ){
          this.updateForCreateField();
        }
      } else {
        this.updateForCreateField();
        ///console.log($.field_and_parent_pair[0]);
      }
    } else {
      _Game_Map_update.call(this, sceneActive);
    }
  };
  
  var map_data = [];
  window.map_infos = null;
  Game_Map.prototype.updateForMapInfoDataLoad = function(){
    map_data = [];
    if($gameTemp.loadAtOnce) {
      // Load MapInfos.js only one time
      map_infos = null;
      DataManager.loadDataFile('map_infos', 'MapInfos.json');
      $gameTemp.loadAtOnce = false;
    }
    if(map_infos){
      // if load is completed
      //console.log(map_infos);
      for(let key in map_infos) {
        if(map_infos[key] !== null){
          //map_data.push(map_infos[key]);
          //console.log(map_infos[key].parentId);
          if($.dungeon_parent_ids.indexOf(map_infos[key].parentId) >= 0){
            $.dungeon_and_parent_pair.push([map_infos[key].id, map_infos[key].parentId]);
          }
          if($.field_parent_ids.indexOf(map_infos[key].parentId) >= 0){
            $.field_and_parent_pair.push([map_infos[key].id, map_infos[key].parentId]);
          }
        }
      }
      //console.log($.dungeon_and_parent_pair);
      //console.log($.field_and_parent_pair);
      this.load_map_infos = false;
      $gameTemp.loadAtOnce = true;
    }
    if(!map_infos){
      return;
    }
  };
 
  window.base_data_map = null;
  window.target_data_map = null;
  Game_Map.prototype.updateForCreateDungeon = function(){
    if($gameTemp.loadAtOnce) {
      // Load only one time
      var target_file_name = 'Map%1.json'.format($.dungeon_and_parent_pair[0][0].padZero(3));
      target_data_map = null;
      DataManager.loadDataFile('target_data_map', target_file_name);
      var base_file_name = 'Map%1.json'.format($.dungeon_and_parent_pair[0][1].padZero(3));
      base_data_map = null;
      DataManager.loadDataFile('base_data_map', base_file_name);
      $gameTemp.loadAtOnce = false;
      //console.log("Load " + target_file_name);
    }   
    if(base_data_map && target_data_map){
      console.log('Create _Map%1'.format($.dungeon_and_parent_pair[0][0].padZero(3)) );
      // if load is completed
      //console.log(base_data_map);
      //console.log(target_data_map);
      let option = readNoteTag(target_data_map.note);
      if(option["SEED"]!==undefined){
        $.random = new Random(option["SEED"]);
      }else{
        $.random = new Random($.dungeon_and_parent_pair[0][0]);
      }
 
      PrepareTiles();
 
      let map2d = LoadTargetMap();
      SearchCorner(map2d);
      MakeLineBuffer(map2d);
      ExtendXPassages(map2d);
      ExtendYPassages(map2d);
      MakeWallAndCeil(map2d);

      let shadow_map = MakeShadow(map2d, option);
 
      let grass_map = MakeGrass(map2d, option);
      let walkable_object_map = MakeWalkableObject(map2d, option);
      let tmp = MakeUnwalkableObject(map2d, option);
      let unwalkable_1x1_object_map = tmp[0];
      let unwalkable_1x2_object_map = tmp[1];
      tmp = MakeWallpaper(map2d, option);
      let wallpaper_1x1_map = tmp[0];
      let wallpaper_1x2_map = tmp[1];
 
      CreateFloorWallAndCeil(map2d, grass_map, walkable_object_map, unwalkable_1x1_object_map, unwalkable_1x2_object_map, wallpaper_1x1_map, wallpaper_1x2_map, shadow_map, option);
 
      if($.console_out===true) {
        ConsoleOut(target_data_map);
      } else {
        var output_file_name = '_Map%1.json'.format($.dungeon_and_parent_pair[0][0].padZero(3));
        StorageManager.saveToLocalDataFile(output_file_name, target_data_map) 
      }
 
      console.log('Map%1 OK!'.format($.dungeon_and_parent_pair[0][0].padZero(3)) );
      $.dungeon_and_parent_pair.shift();
      if($.dungeon_and_parent_pair.length <= 0) {
        console.log("\n\nAll dungeons are created!!\n\n");
      } else if($.console_out===true) {
        console.log('Press ENTER to make next Map.');
        $.console_stopped = true;
      }
      $gameTemp.loadAtOnce = true;
    }
    if(!base_data_map || !target_data_map){
      return;
    }
  };
 
 
  //-----------------------------------------------------------------------------
  // Load base map and prepare the tiles data
  //
  var grass_tiles_num = 0;
  var walkable_1x1_object_tiles_num = 0;
  var unwalkable_1x1_object_tiles_num = 0;
  var unwalkable_1x2_object_tiles_num = 0;
  var wallpaper_1x1_tiles_num = 0;
  var wallpaper_1x2_tiles_num = 0;
  function PrepareTiles() {
    // Read grass tiles
    let y = 1;
    grass_tiles_num = 0;
    for(let x=0; x<base_data_map.width; x++) {
      let tmp = 0;
      for (let z=0; z<6; z++){
        let index = (z*base_data_map.height + y)*base_data_map.width + x;
        tmp += base_data_map.data[index];
      }
      if(tmp==0) break;
      grass_tiles_num++;
    };
 
    // Read walkable 1x1 object tiles
    y = 2;
    walkable_1x1_object_tiles_num = 0;
    for(let x=0; x<base_data_map.width; x++) {
      let tmp = 0;
      for (let z=0; z<6; z++){
        let index = (z*base_data_map.height + y)*base_data_map.width + x;
        tmp += base_data_map.data[index];
      }
      if(tmp==0) break;
      walkable_1x1_object_tiles_num++;
    };
 
    // Read unwalkable 1x1 object tiles
    y = 3;
    unwalkable_1x1_object_tiles_num = 0;
    for(let x=0; x<base_data_map.width; x++) {
      let tmp = 0;
      for (let z=0; z<6; z++){
        let index = (z*base_data_map.height + y)*base_data_map.width + x;
        tmp += base_data_map.data[index];
      }
      if(tmp==0) break;
      unwalkable_1x1_object_tiles_num++;
    };
 
    // Read unwalkable 1x2 object tiles
    y            = 4;
    let y_plus_1 = 5;
    unwalkable_1x2_object_tiles_num = 0;
    for(let x=0; x<base_data_map.width; x++) {
      let tmp = 0;
      for (let z=0; z<6; z++){
        let index = (z*base_data_map.height + y)*base_data_map.width + x;
        tmp += base_data_map.data[index];
        index = (z*base_data_map.height + y_plus_1)*base_data_map.width + x;
        tmp += base_data_map.data[index];
      }
      if(tmp==0) break;
      unwalkable_1x2_object_tiles_num++;
    };
 
    // Read wallpaper 1x1 tiles
    y = 6;
    wallpaper_1x1_tiles_num = 0;
    for(let x=0; x<base_data_map.width; x++) {
      let tmp = 0;
      for (let z=0; z<6; z++){
        let index = (z*base_data_map.height + y)*base_data_map.width + x;
        tmp += base_data_map.data[index];
      }
      if(tmp==0) break;
      wallpaper_1x1_tiles_num++;
    };
 
    // Read wallpaper_1x2_tiles_num 1x2 tiles
    y        = 7;
    y_plus_1 = 8;
    wallpaper_1x2_tiles_num = 0;
    for(let x=0; x<base_data_map.width; x++) {
      let tmp = 0;
      for (let z=0; z<6; z++){
        let index = (z*base_data_map.height + y)*base_data_map.width + x;
        tmp += base_data_map.data[index];
        index = (z*base_data_map.height + y_plus_1)*base_data_map.width + x;
        tmp += base_data_map.data[index];
      }
      if(tmp==0) break;
      wallpaper_1x2_tiles_num++;
    };
 
    //console.log(grass_tiles_num)
    //console.log(walkable_1x1_object_tiles_num)
    //console.log(unwalkable_1x1_object_tiles_num)
    //console.log(unwalkable_1x2_object_tiles_num)
    //console.log(wallpaper_1x1_tiles_num)
    //console.log(wallpaper_1x2_tiles_num)
 
    //var hoge = "";
    //for (let z=0; z<6; z++){
    //  for(let y=0; y<base_data_map.height; y++) {
    //    for(let x=0; x<base_data_map.width; x++) {
    //      var index = (z*base_data_map.height + y)*base_data_map.width + x;
    //      hoge += ("    "+base_data_map.data[index]).substr(-5);
    //    }
    //    hoge += "\n";
    //  }
    //  hoge += "\n\n----------------------------------------------------------------------------------------------------------------\n\n";
    //}
    //console.log(hoge);
  };
 
  //-----------------------------------------------------------------------------
  // Load current map and make 2d binary map
  //
  function LoadTargetMap() {
    let map2d = [];
    for(let y=0; y<target_data_map.height; y++) {
      map2d[y] = [];
    }
 
    for(let y=0; y<target_data_map.height; y++) {
      for(let x=0; x<target_data_map.width; x++) {
        var tmp = 0;
        // for (let z=0; z<6; z++){ <- not include REGION data
        for (let z=0; z<5; z++){
          var index = (z*target_data_map.height + y)*target_data_map.width + x;
          tmp += target_data_map.data[index];
        }
        if( tmp == 0 ) {
          map2d[y][x] = 0;
        } else {
          map2d[y][x] = 1;
        }
      }
    }
 
    //var hoge = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    ////    var index = (0*target_data_map.height + y)*target_data_map.width + x;
    ////    hoge += String(target_data_map.data[index]);
    //    hoge += String(map2d[y][x]);
    //  }
    //  hoge += "\n";
    //}
    //console.log(hoge);
    
    return map2d;
  };
 
  //-----------------------------------------------------------------------------
  // Global data to search and mask the corner 
  //
  const ANY = -9999;
  const NO_MASK = -8888;
  const DAT = {
    q_outer: {
      character: "Q",
      target:[ [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,ANY,  0,ANY,ANY,ANY],
               [ANY,ANY,  0,  0,  0,ANY,ANY],
               [ANY,  0,  0,  1,  1,  1,ANY],
               [ANY,ANY,  0,  1,  1,ANY,ANY],
               [ANY,ANY,ANY,  1,ANY,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY], ],
      mask_a:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -2,     -2,     -1,     -1,NO_MASK],
               [NO_MASK,NO_MASK,     -2,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
      mask_b:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -2,     -2,     -2,     -1,     -1],
               [NO_MASK,NO_MASK,     -2,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
      mask_c:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -3,     -2,     -1,     -1,NO_MASK],
               [NO_MASK,NO_MASK,     -2,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -2,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
    },
    q_inner: {
      character: "q",
      target:[ [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,  1,  1,  1,ANY,ANY],
               [ANY,ANY,  1,  1,  1,ANY,ANY],
               [ANY,ANY,  1,  1,  0,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY], ],
      mask:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
    },
  
    z_outer: {
      character: "Z",
      target:[ [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,ANY,  1,ANY,ANY,ANY],
               [ANY,ANY,  0,  1,  1,ANY,ANY],
               [ANY,  0,  0,  1,  1,  1,ANY],
               [ANY,ANY,  0,  0,  0,ANY,ANY],
               [ANY,ANY,ANY,  0,ANY,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY], ],
      mask_a:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -3,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -3,     -3,     -1,     -1,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
      mask_b:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -3,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -3,     -3,     -3,     -1,     -1],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
      mask_c:[ [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -3,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -3,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,     -3,     -3,     -1,     -1,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
    },
    z_inner: {
      character: "z",
      target:[ [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,  1,  1,  0,ANY,ANY],
               [ANY,ANY,  1,  1,  1,ANY,ANY],
               [ANY,ANY,  1,  1,  1,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY], ],
      mask:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
    },
  
    p_outer:{
      character: "P",
      target:[ [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,ANY,  0,ANY,ANY,ANY],
               [ANY,ANY,  0,  0,  0,ANY,ANY],
               [ANY,  1,  1,  1,  0,  0,ANY],
               [ANY,ANY,  1,  1,  0,ANY,ANY],
               [ANY,ANY,ANY,  1,ANY,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY], ],
      mask_a:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,     -1,     -1,     -2,     -2,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -2,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
      mask_b:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [     -1,     -1,     -2,     -2,     -2,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -2,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
      mask_c:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,     -1,     -1,     -2,     -3,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -2,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -2,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK], ],
    },
    p_inner:{
      character: "p",
      target:[ [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,  1,  1,  1,ANY,ANY],
               [ANY,ANY,  1,  1,  1,ANY,ANY],
               [ANY,ANY,  0,  1,  1,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY], ],
      mask:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
    },
  
    m_outer:{
      character: "M",
      target:[ [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
               [ANY,ANY,ANY,  1,ANY,ANY,ANY],
               [ANY,ANY,  1,  1,  0,ANY,ANY],
               [ANY,  1,  1,  1,  0,  0,ANY],
               [ANY,ANY,  0,  0,  0,ANY,ANY],
               [ANY,ANY,ANY,  0,ANY,ANY,ANY],
               [ANY,ANY,ANY,ANY,ANY,ANY,ANY], ],
      mask_a:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -3,NO_MASK,NO_MASK],
               [NO_MASK,     -1,     -1,     -3,     -3,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
      mask_b:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -3,NO_MASK,NO_MASK],
               [     -1,     -1,     -3,     -3,     -3,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
      mask_c:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -3,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,     -3,NO_MASK,NO_MASK],
               [NO_MASK,     -1,     -1,     -3,     -3,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
               [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
    },
    m_inner:{
      character: "m",
      target:[  [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
                [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
                [ANY,ANY,  0,  1,  1,ANY,ANY],
                [ANY,ANY,  1,  1,  1,ANY,ANY],
                [ANY,ANY,  1,  1,  1,ANY,ANY],
                [ANY,ANY,ANY,ANY,ANY,ANY,ANY],
                [ANY,ANY,ANY,ANY,ANY,ANY,ANY], ],
      mask:[ [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,     -1,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK],
             [NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK,NO_MASK], ],
    },
  };
 
  //-----------------------------------------------------------------------------
  // Search the corner, then mask 2d map
  //
  //var cornerMap = [];
  function SearchCorner(map2d) {
    for(let y=0; y<target_data_map.height; y++) {
      //cornerMap[y] = [];
      for(let x=0; x<target_data_map.width; x++) {
        Object.keys(DAT).forEach(function(key) {
          // Search the corner.
          var val = DAT[key];
          var is_corner = true;
          for(let i=x-2; i<=x+2; i++) {
            if(i< 0               ) continue;
            if(i>=target_data_map.width) continue;
            for(let j=y-2; j<=y+2; j++) {
              if(j< 0                ) continue;
              if(j>=target_data_map.height) continue;
              var n = i - x + 3;
              var m = j - y + 3;
              if(val.target[m][n] == ANY) continue;
              if(val.target[m][n] != map2d[j][i] ) {
                is_corner = false;
              }
            }
          }
 
          // Mask 2d map
          if(is_corner) {
            //cornerMap[y][x] = val.character;
            var mask = null;
            if(key.match(/outer/)) {
              switch ($.random.nextInt(1,3)) {
                case 1:
                  mask = val.mask_a;
                  break;
                case 2:
                  mask = val.mask_b;
                  break;
                case 3:
                  mask = val.mask_c;
                  break;
              }
            }else{
              mask = val.mask;
            }
            for(let i=x-2; i<=x+2; i++) {
              if(i< 0               ) continue;
              if(i>=target_data_map.width) continue;
              for(let j=y-2; j<=y+2; j++) {
                if(j< 0                ) continue;
                if(j>=target_data_map.height) continue;
                var n = i - x + 3;
                var m = j - y + 3;
                if(mask[m][n] == NO_MASK) continue;
                map2d[j][i] = mask[m][n];
              }
            }
          }
        }, DAT);
      }
    }
 
    //var hoge = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    //    if(cornerMap[y][x] === undefined ) {
    //      hoge += "X";
    //    }else{
    //      hoge += String(cornerMap[y][x]);
    //    }
    //  }
    //  hoge += "\n";
    //}
    //console.log(hoge);
 
    //var fuga = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    //    if(map2d[y][x] == 0) {
    //      fuga += " 0";
    //    }else if (map2d[y][x] == 1) {
    //      fuga += " 1";
    //    }else {
    //      fuga += String(map2d[y][x]);
    //    }
    //  }
    //  fuga += "\n";
    //}
    //console.log(fuga);
  };
 
  const NORTH=0;
  const SOUTH=1;
  const WEST =2;
  const EAST =3;
  var x_buffer = [];
  var y_buffer = [];
  function MakeLineBuffer(map2d) {
    x_buffer = [];
    y_buffer = [];
    var count_mode = false;
    var start_x, start_y, length, direction, start_side_closed, end_side_closed;
    for(let y=0; y<target_data_map.height-1; y++) {
      var y_plus_1 = y + 1;
      for(let x=0; x<target_data_map.width; x++) {
        if(count_mode) {
          if( (map2d[y][x] != 0 && map2d[y_plus_1][x] != 0) ||
              (map2d[y][x] == 0 && map2d[y_plus_1][x] == 0) ) {
            count_mode = false;
            if(x==target_data_map.width-1){
              end_side_closed = false;
            }else{
              if(map2d[y][x+1] == 0){
                end_side_closed = false;
              }else{
                end_side_closed = true;
              }
            }
            x_buffer.push({x:start_x, y:start_y, length:length, direction:direction, start_side_closed:start_side_closed, end_side_closed:end_side_closed});
          }else{
            length += 1;
          }
        }else {
          if( (map2d[y][x] == 0 && map2d[y_plus_1][x] == 1) ||
              (map2d[y][x] == 1 && map2d[y_plus_1][x] == 0) ) {
            count_mode = true;
            length = 1;
            start_x = x;
            if(map2d[y][x] == 0 && map2d[y_plus_1][x] == 1){
              start_y = y;
              direction = NORTH;
            }else{
              start_y = y+1;
              direction = SOUTH;
            }
            if(x==0){
              start_side_closed = false;
            }else{
              if(map2d[y][x-1] == 0){
                start_side_closed = false;
              }else{
                start_side_closed = true;
              }
            }
          }
        }
      }
    }
    
    for(let x=0; x<target_data_map.width-1; x++) {
      var x_plus_1 = x + 1;
      for(let y=0; y<target_data_map.height; y++) {
        if(count_mode) {
          if( (map2d[y][x] != 0 && map2d[y][x_plus_1] != 0) ||
              (map2d[y][x] == 0 && map2d[y][x_plus_1] == 0) ) {
            count_mode = false;
            if(y==target_data_map.height-1){
              end_side_closed = false;
            }else{
              if(map2d[y][x+1] == 0){
                end_side_closed = false;
              }else{
                end_side_closed = true;
              }
            }
            y_buffer.push({x:start_x, y:start_y, length:length, direction:direction, start_side_closed:start_side_closed, end_side_closed:end_side_closed});
          }else{
            length += 1;
          }
        }else {
          if( (map2d[y][x] == 0 && map2d[y][x_plus_1] == 1) ||
              (map2d[y][x] == 1 && map2d[y][x_plus_1] == 0) ) {
            count_mode = true;
            length = 1;
            start_y = y;
            if(map2d[y][x] == 0 && map2d[y][x_plus_1] == 1){
              start_x = x;
              direction = WEST;
            }else{
              start_x = x+1;
              direction = EAST;
            }
            if(y==0){
              start_side_closed = false;
            }else{
              if(map2d[y-1][x] == 0){
                start_side_closed = false;
              }else{
                start_side_closed = true;
              }
            }
          }
        }
      }
    }
 
    //for(let i=0; i<x_buffer.length; i++) {
    //  console.log(x_buffer[i]);
    //}
    //for(let i=0; i<y_buffer.length; i++) {
    //  console.log(y_buffer[i]);
    //}
 
  };
 
  const X_PROBABILITY_MAP = [
    // 0,1,2,3,4,5
    [100,0,0,0,0,0], 
    [100,0,0,0,0,0], 
    [100,0,0,0,0,0], 
    [0,100,0,0,0,0], 
    [0,100,0,0,0,0], 
    [0,100,0,0,0,0], 
    [0,100,0,0,0,0], 
    [0,90,10,0,0,0], 
    [0,80,20,0,0,0], 
    [0,70,30,0,0,0], 
    [0,60,40,0,0,0], 
    [0,50,50,0,0,0], 
    [0,40,60,0,0,0], 
    [0,30,70,0,0,0], 
    [0,20,80,0,0,0], 
    [0,10,80,10,0,0],
    [0,0,80,20,0,0],
    [0,0,70,30,0,0],
    [0,0,60,40,0,0],
    [0,0,50,50,0,0],
    [0,0,40,60,0,0],
    [0,0,30,70,0,0],
    [0,0,20,80,0,0],
    [0,0,10,80,10,0],
    [0,0,0,80,20,0],
    [0,0,0,70,30,0],
    [0,0,0,60,40,0],
    [0,0,0,50,50,0],
    [0,0,0,40,60,0],
    [0,0,0,30,70,0],
    [0,0,0,20,80,0],
    [0,0,0,10,80,10], ];
 
  const Y_PROBABILITY_MAP = [
    // 0,1,2,3,4,5
    [100,0,0,0,0,0],
    [100,0,0,0,0,0],
    [100,0,0,0,0,0],
    [0,100,0,0,0,0],
    [0,100,0,0,0,0],
    [0,100,0,0,0,0],
    [0,100,0,0,0,0],
    [0,100,0,0,0,0],
    [0,100,0,0,0,0],
    [0,90,10,0,0,0],
    [0,80,20,0,0,0],
    [0,70,30,0,0,0],
    [0,60,40,0,0,0],
    [0,50,50,0,0,0],
    [0,40,60,0,0,0],
    [0,30,70,0,0,0],
    [0,20,80,0,0,0],
    [0,10,80,10,0,0],
    [0,0,80,20,0,0],
    [0,0,70,30,0,0],
    [0,0,60,40,0,0],
    [0,0,50,50,0,0],
    [0,0,40,60,0,0],
    [0,0,30,70,0,0],
    [0,0,20,80,0,0],
    [0,0,10,80,10,0],
    [0,0,0,80,20,0],
    [0,0,0,70,30,0],
    [0,0,0,60,40,0],
    [0,0,0,50,50,0],
    [0,0,0,40,60,0],
    [0,0,0,30,70,0],
    [0,0,0,20,80,0],
    [0,0,0,10,80,10], ];
 
  const TEMPLATE_NORTH_X_ARRAY = [
    {rand_base_num: 1, type:[-2], lengths:[1]},
    {rand_base_num: 4, type:[-1, -2, -1], lengths:[0, 2, 0]},
    {rand_base_num: 8, type:[-1, -2, -1, -2, -1], lengths:[0, 2, 2, 2, 0]},
    {rand_base_num:12, type:[-1, -2, -1, -2, -1, -2, -1], lengths:[0, 2, 2, 2, 2, 2, 0]},
    {rand_base_num:16, type:[-1, -2, -1, -2, -1, -2, -1, -2, -1], lengths:[0, 2, 2, 2, 2, 2, 2, 2, 0]},
    {rand_base_num:20, type:[-1, -2, -1, -2, -1, -2, -1, -2, -1, -2, -1], lengths:[0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0]},
  ];
  const TEMPLATE_SOUTH_X_ARRAY = [
    {rand_base_num: 1, type:[-3], lengths:[1]},
    {rand_base_num: 4, type:[-1, -3, -1], lengths:[0, 2, 0]},
    {rand_base_num: 8, type:[-1, -3, -1, -3, -1], lengths:[0, 2, 2, 2, 0]},
    {rand_base_num:12, type:[-1, -3, -1, -3, -1, -3, -1], lengths:[0, 2, 2, 2, 2, 2, 0]},
    {rand_base_num:16, type:[-1, -3, -1, -3, -1, -3, -1, -3, -1], lengths:[0, 2, 2, 2, 2, 2, 2, 2, 0]},
    {rand_base_num:20, type:[-1, -3, -1, -3, -1, -3, -1, -3, -1, -3, -1], lengths:[0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0]},
  ];
  //-----------------------------------------------------------------------------
  // Extend x direction passages
  //
  function ExtendXPassages(map2d) {
    for(let i=0; i<x_buffer.length; i++) {
      var j = Math.min(x_buffer[i].length - 1, X_PROBABILITY_MAP.length-1);
      var rand = $.random.nextInt(0, 99);
      for(var k=0; k<X_PROBABILITY_MAP[j].length; k++) {
        rand -= X_PROBABILITY_MAP[j][k];
        if(rand < 0) break;
      }
 
      var x_array;
      if(x_buffer[i].direction==NORTH) {
        x_array = JSON.parse(JSON.stringify(TEMPLATE_NORTH_X_ARRAY[k]));
      }else if(x_buffer[i].direction==SOUTH) {
        x_array = JSON.parse(JSON.stringify(TEMPLATE_SOUTH_X_ARRAY[k]));
      }
      //console.log(x_array.lengths)
    
      if(x_buffer[i].length < 4) {
        x_array.lengths[0] = x_buffer[i].length;
      }else{
        var min = 1;
        var max = x_array.lengths.length - 2;
        var repeat_num = x_buffer[i].length - x_array.rand_base_num + 2;
        if(x_buffer[i].start_side_closed) {
          repeat_num -= 1;
          x_array.lengths[0] = 1;
          min -= 1;
        }
        if(x_buffer[i].end_side_closed) {
          repeat_num -= 1;
          x_array.lengths[x_array.lengths.length - 1] = 1;
          max += 1;
        }
 
        for(let n=0; n<repeat_num; n++) {
          var rand_index = $.random.nextInt(min, max);
          x_array.lengths[rand_index] += 1;
        }
      }
      //console.log(x_array.lengths)
 
      var x = x_buffer[i].x;
      var y = x_buffer[i].y;
      for(let n in x_array.lengths) {
        for(let m=0; m<x_array.lengths[n]; m++) {
          map2d[y][x] = x_array.type[n];
          x++;
        }
      }
    }
    //var fuga = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    //    if(map2d[y][x] == 0) {
    //      fuga += " 0";
    //    }else if (map2d[y][x] == 1) {
    //      fuga += " 1";
    //    }else {
    //      fuga += String(map2d[y][x]);
    //    }
    //  }
    //  fuga += "\n";
    //}
    //console.log(fuga);
  };
  const TEMPLATE_Y_ARRAY = [
    {rand_base_num: 1, type:[-1,],                                                            lengths:[1]},
    {rand_base_num: 6, type:[-1, -3, -2, -1],                                                 lengths:[0, 2, 0]},
    {rand_base_num:12, type:[-1, -3, -2, -1, -3, -2, -1],                                     lengths:[0, 2, 2, 2, 0]},
    {rand_base_num:18, type:[-1, -3, -2, -1, -3, -2, -1, -3, -2, -1],                         lengths:[0, 2, 2, 2, 2, 2, 0]},
    {rand_base_num:24, type:[-1, -3, -2, -1, -3, -2, -1, -3, -2, -1, -3, -2, -1],             lengths:[0, 2, 2, 2, 2, 2, 2, 2, 0]},
    {rand_base_num:30, type:[-1, -3, -2, -1, -3, -2, -1, -3, -2, -1, -3, -2, -1, -3, -2, -1], lengths:[0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0]},
  ];
  //-----------------------------------------------------------------------------
  // Extend y direction passages
  //
  function ExtendYPassages(map2d) {
    for(let i=0; i<y_buffer.length; i++) {
      var j = Math.min(y_buffer[i].length - 1, Y_PROBABILITY_MAP.length - 1);
      var rand = $.random.nextInt(0, 99);
      for(var k=0; k<Y_PROBABILITY_MAP[j].length; k++) {
        rand -= Y_PROBABILITY_MAP[j][k];
        if(rand < 0) break;
      }
 
      var y_array = JSON.parse(JSON.stringify(TEMPLATE_Y_ARRAY[k]));
      //console.log(y_buffer[i]);
      //console.log(y_array.lengths);
      if(y_buffer[i].length < 4) {
        var repeat_num = y_buffer[i].length - y_array.rand_base_num;
        for(let n=0; n<repeat_num; n++) {
          y_array.lengths[0] += 1;
        }
      }else if(y_buffer[i].length == 4) {
        // do nothing y_array.lengths = [0, 2, 2, 0]
      }else if(y_buffer[i].length == 5) {
        // y_array.lengths = [1, 2, 2, 0] or [0, 2, 2, 1]
        if($.random.nextInt(0, 1) == 0){
          y_array.lengths[0] += 1;
        }else{
          y_array.lengths[2] += 1;
        }
      }else{
        var min = 1;
        var max = y_array.lengths.length - 2;
        var repeat_num = y_buffer[i].length - y_array.rand_base_num + 2;
        if(y_buffer[i].start_side_closed) {
          repeat_num -= 1;
          y_array.lengths[0] = 1;
          min -= 1;
        }
        if(y_buffer[i].end_side_closed) {
          repeat_num -= 1;
          y_array.lengths[y_array.lengths.length - 1] = 1;
          max += 1;
        }
        for(let n=0; n<repeat_num; n++) {
          var rand_index = $.random.nextInt(min, max);
          y_array.lengths[rand_index] += 1;
        }
      }
      //console.log(y_array.lengths);
      var len = y_array.lengths.length-2;
      for(let n=len; n>=0; n-=2) {
        if(n==len && y_buffer[i].end_side_closed==false) {
      //console.log(y_array.lengths);
          y_array.lengths[len] += 2;
        }else{
          y_array.lengths.splice(n+1, 0, 2);
        }
      }
      //console.log(y_array.lengths);
 
      var x = y_buffer[i].x;
      var y = y_buffer[i].y;
      for(let n in y_array.lengths) {
        for(let m=0; m<y_array.lengths[n]; m++) {
          map2d[y][x] = y_array.type[n];
          y++;
        }
      }
    }
    //var fuga = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    //    if(map2d[y][x] == 0) {
    //      fuga += " 0";
    //    }else if (map2d[y][x] == 1) {
    //      fuga += " 1";
    //    }else {
    //      fuga += String(map2d[y][x]);
    //    }
    //  }
    //  fuga += "\n";
    //}
    //console.log(fuga);
  };
 
  function MakeWallAndCeil(map2d) {
    for(let x=0; x<target_data_map.width; x++) {
      for(let y=0; y<target_data_map.height-1; y++) {
        if(map2d[y][x]==0 && map2d[y+1][x]==-2){
          map2d[y][x] = -2;
        }
      }
    }
    for(let x=0; x<target_data_map.width; x++) {
      for(let y=0; y<target_data_map.height-2; y++) {
        if(map2d[y][x]==0 && map2d[y+1][x]==0 && map2d[y+2][x]==-1){
          map2d[y][x]   = -2;
          map2d[y+1][x] = -2;
        }
        if(map2d[y][x]==-2 && map2d[y+1][x]==-2 && map2d[y+2][x]==-2){
          map2d[y][x]   = -3;
        }
      }
    }
    for(let x=0; x<target_data_map.width; x++) {
      var y = 0;
      var y_plus_1 = 1;
      if(map2d[y][x]==0 && map2d[y_plus_1][x]==-1){
        map2d[y][x]   = -2;
      }
    }
    for(let y=0; y<target_data_map.height; y++) {
      for(let x=0; x<target_data_map.width; x++) {
        if(map2d[y][x]==0){
          map2d[y][x] = -3;
        }
      }
    }
 
    //var fuga = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    //    if(map2d[y][x] == 0) {
    //      fuga += " 0";
    //    }else if (map2d[y][x] == 1) {
    //      fuga += " 1";
    //    }else {
    //      fuga += String(map2d[y][x]);
    //    }
    //  }
    //  fuga += "\n";
    //}
    //console.log(fuga);
  };
 
  function MakeShadow(map2d, option) {
    let shadow_map = [];
    for(let y=0; y<target_data_map.height; y++) {
      shadow_map[y] = [];
      for(let x=0; x<target_data_map.width; x++) {
        shadow_map[y][x] = 0;
      }
    }
    for(let y=0; y<target_data_map.height; y++) {
      for(let x=target_data_map.width-1; x>=1; x--) {
        let xx = (option["DUNGEON_SYMMETRY"] && x >= target_data_map.width/2)  ? target_data_map.width-1-x  : x;
        let delta_x = (option["DUNGEON_SYMMETRY"] && x >= target_data_map.width/2)  ? 1 : -1;
        if(x==target_data_map.width/2){
          delta_x = 0;
        }
        if( (map2d[y][xx]==-1 || map2d[y][xx]==1) && (map2d[y][xx+delta_x]==-2 || map2d[y][xx+delta_x]==-3) ){
          shadow_map[y][x] = 1;
        }
      }
    }
    //var fuga = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    //    fuga += String(shadow_map[y][x]);
    //  }
    //  fuga += "\n";
    //}
    //console.log(fuga);

    return shadow_map;
  };
 
  const MARGIN_X_GRASS = 2;
  const MARGIN_Y_GRASS = 2;
  const ITERATION_NUM_GRASS = 100;
  const MIN_LENGTH_GRASS = 5;
  const MAX_LENGTH_GRASS = 15;
  function MakeGrass(map2d, option) {
    let grass_map = [];
    let block_length_x = option["BLOCK_A_OBJ_X"] + MARGIN_X_GRASS;
    let block_length_y = option["BLOCK_A_OBJ_Y"] + MARGIN_Y_GRASS;
    for(let y=0; y<target_data_map.height; y++) {
      grass_map[y] = [];
      for(let x=0; x<target_data_map.width; x++) {
        grass_map[y][x] = 0;
      }
    }
    if(grass_tiles_num==0){
      return;
    }
 
    let region_x_num = Math.ceil(target_data_map.width /block_length_x);
    let region_y_num = Math.ceil(target_data_map.height/block_length_y);
    for(let j=0; j<region_y_num; j++) {
      for(let i=0; i<region_x_num; i++) {
        if($.random.nextInt(0,1) == 0) {
          let rand_grass_tile_id = $.random.nextInt(1, grass_tiles_num);
          //let rand_grass_tile_id = $.random.nextInt(1, 2);
          for(let k=0; k<ITERATION_NUM_GRASS; k++) {
            let x = $.random.nextInt(i*block_length_x + MARGIN_X_GRASS, (i+1)*block_length_x - MARGIN_X_GRASS);
            if( (x+1)>=target_data_map.width ) continue;
            let y = $.random.nextInt(j*block_length_y + MARGIN_Y_GRASS, (j+1)*block_length_y - MARGIN_Y_GRASS);
            if( (y+1)>=target_data_map.height ) continue;
            let z = 5;
            let index = (z*target_data_map.height + y)*target_data_map.width + x;
            if( target_data_map.data[index] === option["LIMIT_A_OBJ"] ) continue;

            if( (map2d[y][x]     == 1 || map2d[y][x]     == -1) &&
                (map2d[y][x+1]   == 1 || map2d[y][x+1]   == -1) &&
                (map2d[y+1][x]   == 1 || map2d[y+1][x]   == -1) &&
                (map2d[y+1][x+1] == 1 || map2d[y+1][x+1] == -1) ) {
              grass_map[y][x]     = rand_grass_tile_id;
              grass_map[y][x+1]   = rand_grass_tile_id;
              grass_map[y+1][x]   = rand_grass_tile_id;
              grass_map[y+1][x+1] = rand_grass_tile_id;
 
              let snake_length = $.random.nextInt(MIN_LENGTH_GRASS, MAX_LENGTH_GRASS);
              for(let s=0; s<snake_length; s++) {
                let next_x = x;
                let next_y = y;
                let random_direction = $.random.nextInt(1,8);
                if(random_direction>=5) random_direction+=1;
                if(random_direction==1 || random_direction==2 || random_direction==3) {
                  next_y = y + 1;
                }
                if(random_direction==1 || random_direction==4 || random_direction==7) {
                  next_x = x - 1;
                }
                if(random_direction==3 || random_direction==6 || random_direction==9) {
                  next_x = x + 1;
                }
                if(random_direction==7 || random_direction==8 || random_direction==9) {
                  next_y = y - 1;
                }
                if( next_x < 0 || (next_x+1)>=target_data_map.width  ) continue;
                if( next_y < 0 || (next_y+1)>=target_data_map.height ) continue;
 
                x = next_x;
                y = next_y;
                if( (map2d[y][x]     == 1 || map2d[y][x]     == -1) &&
                    (map2d[y][x+1]   == 1 || map2d[y][x+1]   == -1) &&
                    (map2d[y+1][x]   == 1 || map2d[y+1][x]   == -1) &&
                    (map2d[y+1][x+1] == 1 || map2d[y+1][x+1] == -1) ) {
                  grass_map[y][x]     = rand_grass_tile_id;
                  grass_map[y][x+1]   = rand_grass_tile_id;
                  grass_map[y+1][x]   = rand_grass_tile_id;
                  grass_map[y+1][x+1] = rand_grass_tile_id;
                }
              }
              
              break;
            }
          }
        }
      }
    }
 
    //let fuga = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    //    fuga += String(grass_map[y][x]);
    //  }
    //  fuga += "\n";
    //}
    //console.log(fuga);
    
    return grass_map;
  };
 
  const ITERATION_NUM_OBJECT = 100;
  function MakeWalkableObject(map2d, option) {
    let walkable_object_map = [];
    for(let y=0; y<target_data_map.height; y++) {
      walkable_object_map[y] = [];
      for(let x=0; x<target_data_map.width; x++) {
        walkable_object_map[y][x] = 0;
      }
    }
 
    var region_x_num = Math.ceil(target_data_map.width /option["BLOCK_W_OBJ_X"]);
    var region_y_num = Math.ceil(target_data_map.height/option["BLOCK_W_OBJ_Y"]);
    if(walkable_1x1_object_tiles_num!=0){
      for(let j=0; j<region_y_num; j++) {
        for(let i=0; i<region_x_num; i++) {
          for(var ite=0; ite<ITERATION_NUM_OBJECT; ite++) {
            var x = $.random.nextInt(i*option["BLOCK_W_OBJ_X"], (i+1)*option["BLOCK_W_OBJ_X"]);
            if( (x+1)>=target_data_map.width ) continue;
            var y = $.random.nextInt(j*option["BLOCK_W_OBJ_Y"], (j+1)*option["BLOCK_W_OBJ_Y"]);
            if( (y+1)>=target_data_map.height ) continue;
            let z = 5;
            let index = (z*target_data_map.height + y)*target_data_map.width + x;
            if( target_data_map.data[index] === option["LIMIT_W_OBJ"] ) continue;
            if(map2d[y][x] == 1 || map2d[y][x] == -1) break;
          };
          if(ite==ITERATION_NUM_OBJECT) continue;
          var rand_object_tile_id = $.random.nextInt(1, walkable_1x1_object_tiles_num);
          walkable_object_map[y][x] = rand_object_tile_id;
        }
      }
    };

    //let hoge = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    //    hoge += walkable_object_map[y][x];
    //  }
    //  hoge += "\n";
    //}
    //console.log(hoge);

    return walkable_object_map;
 
  };
 
  function MakeUnwalkableObject(map2d, option) {
    let unwalkable_1x1_object_map = [];
    let unwalkable_1x2_object_map = [];
    for(let y=0; y<target_data_map.height; y++) {
      unwalkable_1x1_object_map[y] = [];
      unwalkable_1x2_object_map[y] = [];
      for(let x=0; x<target_data_map.width; x++) {
        unwalkable_1x1_object_map[y][x] = 0;
        unwalkable_1x2_object_map[y][x] = 0;
      }
    }
 
    if(unwalkable_1x1_object_tiles_num!=0 || unwalkable_1x2_object_tiles_num!=0){
      var region_x_num = Math.ceil(target_data_map.width /option["BLOCK_U_OBJ_X"]);
      var region_y_num = Math.ceil(target_data_map.height/option["BLOCK_U_OBJ_X"]);
      for(let j=0; j<region_y_num; j++) {
        for(let i=0; i<region_x_num; i++) {
          for(var ite=0; ite<ITERATION_NUM_OBJECT; ite++) {
            var x = $.random.nextInt(i*option["BLOCK_U_OBJ_X"], (i+1)*option["BLOCK_U_OBJ_X"]);
            if( (x+1)>=target_data_map.width ) continue;
            var y = $.random.nextInt(j*option["BLOCK_U_OBJ_Y"], (j+1)*option["BLOCK_U_OBJ_Y"]);
            if( (y+1)>=target_data_map.height ) continue;
            let z = 5;
            let index = (z*target_data_map.height + y)*target_data_map.width + x;
            if( target_data_map.data[index] === option["LIMIT_U_OBJ"] ) continue;
            if((map2d[y][x] == 1 && $.random.nextInt(0,2)<2) || map2d[y][x] == -1) break;
          };
          if(ite>=100) continue;
          if(y-1<0) continue;
          if(unwalkable_1x1_object_tiles_num!=0 && unwalkable_1x2_object_tiles_num==0){
            var rand_object_tile_id = $.random.nextInt(1, unwalkable_1x1_object_tiles_num);
            unwalkable_1x1_object_map[y][x] = rand_object_tile_id;
          }else if(unwalkable_1x1_object_tiles_num==0 && unwalkable_1x2_object_tiles_num!=0){
            var rand_object_tile_id = $.random.nextInt(1, unwalkable_1x2_object_tiles_num);
            unwalkable_1x2_object_map[y-1][x] = rand_object_tile_id;
          }else {
            if($.random.nextInt(0, 4) < 4) {
              var rand_object_tile_id = $.random.nextInt(1, unwalkable_1x1_object_tiles_num);
              unwalkable_1x1_object_map[y][x] = rand_object_tile_id;
            }else{
              var rand_object_tile_id = $.random.nextInt(1, unwalkable_1x2_object_tiles_num);
              unwalkable_1x2_object_map[y-1][x] = rand_object_tile_id;
            }
          }
        }
      }
      // Clean up neighbor unwalkbale object
      for(let y=1; y<target_data_map.height; y++) {
        for(let x=0; x<target_data_map.width-1; x++) {
          if(unwalkable_1x1_object_map[y][x]   != 0 && unwalkable_1x1_object_map[y][x+1]   !=0){
            if($.random.nextInt(0,1)<1){
              unwalkable_1x1_object_map[y][x] = 0;
            }else{
              unwalkable_1x1_object_map[y][x+1] = 0;
            }
          }
          if(unwalkable_1x2_object_map[y-1][x] != 0 && unwalkable_1x2_object_map[y-1][x+1] !=0){
            if($.random.nextInt(0,1)<1){
              unwalkable_1x2_object_map[y-1][x] = 0;
            }else{
              unwalkable_1x2_object_map[y-1][x+1] = 0;
            }
          }
          if(unwalkable_1x1_object_map[y][x]   != 0 && unwalkable_1x2_object_map[y-1][x+1] !=0){
            if($.random.nextInt(0,1)<1){
              unwalkable_1x1_object_map[y][x] = 0;
            }else{
              unwalkable_1x2_object_map[y-1][x+1] = 0;
            }
          }
          if(unwalkable_1x2_object_map[y-1][x] != 0 && unwalkable_1x1_object_map[y][x+1] !=0){
            if($.random.nextInt(0,1)<1){
              unwalkable_1x2_object_map[y-1][x] = 0;
            }else{
              unwalkable_1x1_object_map[y][x+1] = 0;
            }
          }
        }
      }
      for(let y=1; y<target_data_map.height-1; y++) {
        for(let x=0; x<target_data_map.width; x++) {
          if(unwalkable_1x1_object_map[y][x]   != 0 && unwalkable_1x1_object_map[y+1][x]   !=0){
            if($.random.nextInt(0,1)<1){
              unwalkable_1x1_object_map[y][x] = 0;
            }else{
              unwalkable_1x1_object_map[y+1][x] = 0;
            }
          }
          if(unwalkable_1x2_object_map[y-1][x] != 0 && unwalkable_1x2_object_map[y][x] !=0){
            if($.random.nextInt(0,1)<1){
              unwalkable_1x2_object_map[y-1][x] = 0;
            }else{
              unwalkable_1x2_object_map[y][x] = 0;
            }
          }
          if(unwalkable_1x1_object_map[y][x]   != 0 && unwalkable_1x2_object_map[y][x] !=0){
            if($.random.nextInt(0,1)<1){
              unwalkable_1x1_object_map[y][x] = 0;
            }else{
              unwalkable_1x2_object_map[y][x] = 0;
            }
          }
          if(unwalkable_1x2_object_map[y-1][x] != 0 && unwalkable_1x1_object_map[y+1][x] !=0){
            if($.random.nextInt(0,1)<1){
              unwalkable_1x2_object_map[y-1][x] = 0;
            }else{
              unwalkable_1x1_object_map[y+1][x] = 0;
            }
          }
        }
      }
 
    }

    return [unwalkable_1x1_object_map, unwalkable_1x2_object_map];
 
    //var fuga = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    //    fuga += String(walkable_object_map[y][x]);
    //  }
    //  fuga += "\n";
    //}
    //console.log(fuga);
  };
 
  const ITERATION_NUM_WALLPAPER = 100;
  function MakeWallpaper(map2d, option) {
    let wallpaper_1x1_map = [];
    let wallpaper_1x2_map = [];
    if(wallpaper_1x1_tiles_num==0 && wallpaper_1x2_tiles_num==0){
      return;
    }
 
    for(let y=0; y<target_data_map.height; y++) {
      wallpaper_1x1_map[y] = [];
      wallpaper_1x2_map[y] = [];
      for(let x=0; x<target_data_map.width; x++) {
        wallpaper_1x1_map[y][x] = 0;
        wallpaper_1x2_map[y][x] = 0;
      }
    }
 
    var region_x_num = Math.ceil(target_data_map.width /option["BLOCK_WALL_X"]);
    var region_y_num = Math.ceil(target_data_map.height/option["BLOCK_WALL_Y"]);
    for(let j=0; j<region_y_num; j++) {
      for(let i=0; i<region_x_num; i++) {
        for(var ite=0; ite<100; ite++) {
          var x = $.random.nextInt(i*option["BLOCK_WALL_X"], (i+1)*option["BLOCK_WALL_X"]);
          if( (x+1)>=target_data_map.width ) continue;
          var y = $.random.nextInt(j*option["BLOCK_WALL_X"], (j+1)*option["BLOCK_WALL_Y"]);
          if( (y+1)>=target_data_map.height ) continue;
          if( y-1<0 ) continue;
          let z = 5;
          let index = (z*target_data_map.height + y)*target_data_map.width + x;
          if( target_data_map.data[index] === option["LIMIT_WALL"] ) continue;
          if(map2d[y-1][x] == -2 && map2d[y][x] == -2) break;
        };
        if(ite>=100) continue;
        if(wallpaper_1x2_tiles_num==0) {
          var rand_wallpaper_tile_id = $.random.nextInt(1, wallpaper_1x1_tiles_num);
          wallpaper_1x1_map[y][x] = rand_wallpaper_tile_id;
        }else if(wallpaper_1x1_tiles_num==0) {
          var rand_wallpaper_tile_id = $.random.nextInt(1, wallpaper_1x2_tiles_num);
          wallpaper_1x2_map[y-1][x] = rand_wallpaper_tile_id;
        }else{
          if($.random.nextInt(0, 1) < 1) {
            var rand_wallpaper_tile_id = $.random.nextInt(1, wallpaper_1x1_tiles_num);
            wallpaper_1x1_map[y][x] = rand_wallpaper_tile_id;
          }else{
            var rand_wallpaper_tile_id = $.random.nextInt(1, wallpaper_1x2_tiles_num);
            wallpaper_1x2_map[y-1][x] = rand_wallpaper_tile_id;
          }
        }
      }
    };
 
    //var fuga = "";
    //for(let y=0; y<target_data_map.height; y++) {
    //  for(let x=0; x<target_data_map.width; x++) {
    //    fuga += String(walkable_object_map[y][x]);
    //  }
    //  fuga += "\n";
    //}
    //console.log(fuga);
    //
    //
    return [wallpaper_1x1_map, wallpaper_1x2_map];
  };
 
  function CreateFloorWallAndCeil(map2d, grass_map, walkable_object_map, unwalkable_1x1_object_map, unwalkable_1x2_object_map, wallpaper_1x1_map, wallpaper_1x2_map, shadow_map, option) {
    for(let y=0; y<target_data_map.height; y++) {
      for(let x=0; x<target_data_map.width; x++) {
        let xx = (option["DUNGEON_SYMMETRY"] && x >= target_data_map.width/2)  ? target_data_map.width-1-x  : x;
        if(map2d[y][xx] == -3) {
          $.applySupponCTI([ 'auto', 'abc', '2', '0', '1', '1', String(x), String(y) ], base_data_map);
        }else if(map2d[y][xx] == -2) {
          $.applySupponCTI([ 'auto', 'abc', '1', '0', '1', '1', String(x), String(y) ], base_data_map);
        }else if( (map2d[y][xx] == -1) || (map2d[y][xx] == 1) ) {
          $.applySupponCTI([ 'auto', 'abc', '0', '0', '1', '1', String(x), String(y) ], base_data_map);
        }
      }
    }
 
    if(option["ADD_A_OBJ"]) {
      if(grass_tiles_num!=0){
        for(let y=0; y<target_data_map.height; y++) {
          for(let x=0; x<target_data_map.width; x++) {
            let xx = (option["DUNGEON_SYMMETRY"] && x >= target_data_map.width/2)  ? target_data_map.width-1-x  : x;
            if(grass_map[y][xx] != 0) {
              $.applySupponCTI([ 'autoadd', 'abc', String(grass_map[y][xx]-1), '1', '1', '1', String(x), String(y) ], base_data_map );
            }
          }
        }
      }
    }
 
    if(option["ADD_WALL"]) {
      if(wallpaper_1x1_tiles_num!=0 || wallpaper_1x2_tiles_num!=0){
        for(let y=target_data_map.height-1; y>=0; y--) {
          for(let x=0; x<target_data_map.width; x++) {
            let xx = (option["DUNGEON_SYMMETRY"] && x >= target_data_map.width/2)  ? target_data_map.width-1-x  : x;
            if(wallpaper_1x1_map[y][xx] != 0) {
              $.applySupponCTI([ 'add', 'abc', String(wallpaper_1x1_map[y][xx]-1), '6', '1', '1', String(x), String(y) ], base_data_map);
            }
          }
        }
 
        for(let y=target_data_map.height-1; y>=0; y--) {
          for(let x=0; x<target_data_map.width; x++) {
            let xx = (option["DUNGEON_SYMMETRY"] && x >= target_data_map.width/2)  ? target_data_map.width-1-x  : x;
            if(wallpaper_1x2_map[y][xx] != 0) {
              $.applySupponCTI([ 'add', 'abc', String(wallpaper_1x2_map[y][xx]-1), '7', '1', '2', String(x), String(y) ] , base_data_map);
            }
          }
        }
      }
    };
 
    if(option["ADD_W_OBJ"]) {
      for(let y=0; y<target_data_map.height; y++) {
        for(let x=0; x<target_data_map.width; x++) {
          let xx = (option["DUNGEON_SYMMETRY"] && x >= target_data_map.width/2)  ? target_data_map.width-1-x  : x;
          if(walkable_object_map[y][xx] != 0) {
            $.applySupponCTI(['add', 'abc', String(walkable_object_map[y][xx]-1), '2', '1', '1', String(x), String(y)], base_data_map); 
          }
        }
      }
    }
 
    if(option["ADD_U_OBJ"]) {
      for(let y=0; y<target_data_map.height; y++) {
        for(let x=0; x<target_data_map.width; x++) {
          let xx = (option["DUNGEON_SYMMETRY"] && x >= target_data_map.width/2)  ? target_data_map.width-1-x  : x;
          if(unwalkable_1x1_object_map[y][xx] != 0) {
            $.applySupponCTI([ 'add', 'abc', String(unwalkable_1x1_object_map[y][xx]-1), '3', '1', '1', String(x), String(y) ], base_data_map);
          }
        }
      }
      for(let y=target_data_map.height-1; y>=0; y--) {
        for(let x=0; x<target_data_map.width; x++) {
          let xx = (option["DUNGEON_SYMMETRY"] && x >= target_data_map.width/2)  ? target_data_map.width-1-x  : x;
          if(unwalkable_1x2_object_map[y][xx] != 0) {
            $.applySupponCTI([ 'add', 'abc', String(unwalkable_1x2_object_map[y][xx]-1), '4', '1', '2', String(x), String(y) ], base_data_map);
          }
        }
      }
    }
 
    for(let y=0; y<target_data_map.height; y++) {
      for(let x=0; x<target_data_map.width; x++) {
        if(shadow_map[y][x] == 1) {
          var z = 4;
          var index = (z*target_data_map.height + y)*target_data_map.width + x;
          target_data_map.data[index] = 5;
        }
      }
    }
  };

  Game_Map.prototype.updateForCreateField = function(){
    if($gameTemp.loadAtOnce) {
 
      // Load only one time
      var target_file_name = 'Map%1.json'.format($.field_and_parent_pair[0][0].padZero(3));
      target_data_map = null;
      DataManager.loadDataFile('target_data_map', target_file_name);
      var base_file_name = 'Map%1.json'.format($.field_and_parent_pair[0][1].padZero(3));
      base_data_map = null;
      DataManager.loadDataFile('base_data_map', base_file_name);
      $gameTemp.loadAtOnce = false;
      //console.log("Load " + target_file_name);
      /*
      */
    }   
    if(base_data_map && target_data_map){
      console.log('Create _Map%1'.format($.field_and_parent_pair[0][0].padZero(3)) );
      // if load is completed
      //console.log(base_data_map);
      //console.log(target_data_map);
 
      let option = readNoteTag(target_data_map.note, "Field");
      // Make random with map id as seed.
      if(option["SEED"]!==undefined){
        $.random = new Random(option["SEED"]);
        noise.seed(option["SEED"]);
      }else{
        $.random = new Random($.field_and_parent_pair[0][0]);
        noise.seed($.field_and_parent_pair[0][0]);
      }

      PrepareTiles();
 
      let depth_map;
      if(option["FIELD_TYPE"]==="shield"){
        depth_map = MakeShieldDepthMap(target_data_map.width, target_data_map.height, option);
      }else if(option["FIELD_TYPE"]==="terrace"){
        depth_map = MakeTerraceDepthMap(target_data_map.width, target_data_map.height, option);
      }else if(option["FIELD_TYPE"]==="mix"){
        depth_map = MakeMixDepthMap(target_data_map.width, target_data_map.height, option);
      }
      let cliff_and_border_map = MakeCliffAndBorderMap(depth_map);

      let tree_map = MakeTreeMap(target_data_map.width, target_data_map.height, cliff_and_border_map, option);

      let map2d = MakeMap2dForField(cliff_and_border_map, tree_map);
      let grass_map = MakeGrass(map2d, option);
      let walkable_object_map = MakeWalkableObject(map2d, option);
      let tmp = MakeUnwalkableObject(map2d, option);
      let unwalkable_1x1_object_map = tmp[0];
      let unwalkable_1x2_object_map = tmp[1];
      tmp = MakeWallpaper(map2d, option);
      let wallpaper_1x1_map = tmp[0];
      let wallpaper_1x2_map = tmp[1];
 
      let shadow_map = MakeShadowForField(depth_map);
      //
      ApplyTiles(cliff_and_border_map, grass_map, walkable_object_map, unwalkable_1x1_object_map, unwalkable_1x2_object_map, wallpaper_1x1_map, wallpaper_1x2_map, tree_map, shadow_map, option);
 
      if($.console_out===true) {
        ConsoleOut(target_data_map);
      } else {
        var output_file_name = '_Map%1.json'.format($.field_and_parent_pair[0][0].padZero(3));
        StorageManager.saveToLocalDataFile(output_file_name, target_data_map) 
      }
 
      console.log('Map%1 OK!'.format($.field_and_parent_pair[0][0].padZero(3)) );
      $.field_and_parent_pair.shift();
      if($.field_and_parent_pair.length <= 0) {
        console.log("All fields are created!!");
      } else if($.console_out===true) {
        console.log('Press ENTER to make next Map.');
        $.console_stopped = true;
      }
      $gameTemp.loadAtOnce = true;
    }
    if(!base_data_map || !target_data_map){
      return;
    }
  };
 
  function MakeShieldDepthMap(width, height, option) {
    var depth_map = [];
    for (var y = 0; y < height; y++) {
      depth_map[y] = [];
    }
    
    var x_relief = option["SHIELD_RELIEF_X"];
    var y_relief = option["SHIELD_RELIEF_Y"];
    
    var max_depth = option["SHIELD_MAX_DEPTH"];
    
    var max = 0;
    var min = 0;
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var value = noise.perlin2(x / x_relief, y / y_relief);
        max = Math.max(value, max);
        min = Math.min(value, min);
        depth_map[y][x] = value;
      }
    }
    var normalize_factor = max_depth / (max - min);
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        depth_map[y][x] -= min;
        depth_map[y][x] *= normalize_factor;
        depth_map[y][x] = Math.floor(depth_map[y][x]);
        depth_map[y][x] = Math.max(depth_map[y][x], 0);
        depth_map[y][x] = Math.min(max_depth-1, depth_map[y][x]);
   //     depth_map[y][x] *= 2;
      }
    }
    
    // Modify litte y geometry such as "1 2 2 2 1"
    //                                    ~~~~~
    for (var y = 0; y < height-4; y++) {
      for (var x = 0; x < width; x++) {
        let a = Math.abs(depth_map[y  ][x] - depth_map[y][x]);
        let b = Math.abs(depth_map[y+1][x] - depth_map[y][x]);
        let c = Math.abs(depth_map[y+2][x] - depth_map[y][x]);
        let d = Math.abs(depth_map[y+3][x] - depth_map[y][x]);
        let e = Math.abs(depth_map[y+4][x] - depth_map[y][x]);
        if( a===0 && (b!==0 || c!==0 || d===0) && e===0 ){
          depth_map[y  ][x] = depth_map[y][x];
          depth_map[y+1][x] = depth_map[y][x];
          depth_map[y+2][x] = depth_map[y][x];
          depth_map[y+3][x] = depth_map[y][x];
          depth_map[y+4][x] = depth_map[y][x];
        }
      }
    }
    
    // Modify litte x geometry such as "1 2 1"
    //                                    ~
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width-1; x++) {
        let a = Math.abs(depth_map[y][x  ] - depth_map[y][x]);
        let b = Math.abs(depth_map[y][x+1] - depth_map[y][x]);
        let c = Math.abs(depth_map[y][x+2] - depth_map[y][x]);
        if( a===0 && b!==0 && c===0 ){
          depth_map[y][x  ] = depth_map[y][x];
          depth_map[y][x+1] = depth_map[y][x];
          depth_map[y][x+2] = depth_map[y][x];
        }
      }
    }
    
    //var hoge = "";
    //for (var y = 0; y < height; y++) {
    //  for (var x = 0; x < width; x++) {
    //    hoge += String(depth_map[y][x]) + ",";
    //  }
    //  hoge += "\n";
    //}
    //StorageManager.saveToLocalDataFilePlain("piyo.csv", hoge) 
 
    return depth_map;
  };

  function MakeTerraceDepthMap(width, height, option) {
    var depth_map = [];
    var deform_map = [];
    let terrace_length = Math.floor(height/option["TERRACE_MAX_DEPTH"]);
    for (var y = 0; y < height; y++) {
      depth_map[y] = [];
      deform_map[y] = [];
      for (var x = 0; x < width; x++) {
        depth_map[y][x] = option["TERRACE_MAX_DEPTH"] - Math.floor( y/terrace_length );
      }
    };
    
    var x_relief = option["TERRACE_RELIEF_X"];
    var y_relief = option["TERRACE_RELIEF_Y"];
    
    var max_deform = option["TERRACE_DEFORM"];
    
    var max = 0;
    var min = 0;
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var value = noise.perlin2(x / x_relief, y / y_relief);
        max = Math.max(value, max);
        min = Math.min(value, min);
        deform_map[y][x] = value;
      }
    }
    var normalize_factor = max_deform / (max - min);
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        deform_map[y][x] -= min;
        deform_map[y][x] *= normalize_factor;
        deform_map[y][x] = Math.floor(deform_map[y][x]);
        deform_map[y][x] = Math.max(deform_map[y][x], 0);
        deform_map[y][x] = Math.min(max_deform-1, deform_map[y][x]);
      }
    }

    for (var y = terrace_length-1; y < height-terrace_length; y+=terrace_length) {
      for (var x = 0; x < width; x++) {
        for(let i=0; i<deform_map[y][x]; i++){
          if(y-i<0) continue;
          depth_map[y-i][x] -= 1;
        }
      }
    }
    
    // Modify litte x geometry such as "1 2 1"
    //                                    ~
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width-1; x++) {
        let a = Math.abs(depth_map[y][x  ] - depth_map[y][x]);
        let b = Math.abs(depth_map[y][x+1] - depth_map[y][x]);
        let c = Math.abs(depth_map[y][x+2] - depth_map[y][x]);
        if( a===0 && b!==0 && c===0 ){
          depth_map[y][x  ] = depth_map[y][x];
          depth_map[y][x+1] = depth_map[y][x];
          depth_map[y][x+2] = depth_map[y][x];
        }
      }
    }
    
    //var hoge = "";
    //for (var y = 0; y < height; y++) {
    //  for (var x = 0; x < width; x++) {
    //    hoge += String(depth_map[y][x]) + ",";
    //  }
    //  hoge += "\n";
    //}
    //hoge += "-----------------------------------------------------------------------------------------\n";
    //for (var y = 0; y < height; y++) {
    //  for (var x = 0; x < width; x++) {
    //    hoge += String(deform_map[y][x]) + ",";
    //  }
    //  hoge += "\n";
    //}
    //hoge += "-----------------------------------------------------------------------------------------\n";
    //for (var y = terrace_length-1; y < height; y+=terrace_length) {
    //  for (var x = 0; x < width; x++) {
    //    hoge += String(deform_map[y][x]) + ",";
    //  }
    //  hoge += "\n";
    //}
    //console.log(hoge);
    //StorageManager.saveToLocalDataFilePlain("piyo.csv", hoge) 
 
    return depth_map;
  };

  function MakeMixDepthMap(width, height, option) {
    option["SHIELD_MAX_DEPTH"] = 3;
    let shield_depth_map  = MakeShieldDepthMap(width, height, option);
    // Change shield_depth_map from [0, 1, 2] to [-1, 0, 1]
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        shield_depth_map[y][x] -= 1;
      }
    }
    let terrace_depth_map = MakeTerraceDepthMap(width, height, option);

    //var hoge = "";
    //for (var y = 0; y < height; y++) {
    //  for (var x = 0; x < width; x++) {
    //    hoge += String(shield_depth_map[y][x]) + ",";
    //  }
    //  hoge += "\n";
    //}
    //hoge += "-----------------------------------------------------------------------------------------\n";
    //for (var y = 0; y < height; y++) {
    //  for (var x = 0; x < width; x++) {
    //    hoge += String(terrace_depth_map[y][x]) + ",";
    //  }
    //  hoge += "\n";
    //}
    //hoge += "-----------------------------------------------------------------------------------------\n";


    let tmp_map = [];
    for (var y = 0; y < height; y++) {
      tmp_map[y] = [];
      for (var x = 0; x < width; x++) {
        if(shield_depth_map[y][x] == -1) {
          tmp_map[y][x] = terrace_depth_map[y][x] + shield_depth_map[y][x];
        }else{
          tmp_map[y][x] = 0;
        }
      }
    }
    for (var x = 0; x < width; x++) {
      let mode = "zero";
      let first_contact_number = 0;
      for (var y = 0; y < height; y++) {
        if(mode==="zero" && tmp_map[y][x]!==0){
          first_contact_number = tmp_map[y][x];
          mode = "first_contact";
        }
        if(mode==="first_contact" && tmp_map[y][x]!==first_contact_number){
          first_contact_number = 0;
          mode = "delete";
        }
        if(mode==="delete" && tmp_map[y][x]!==0){
          shield_depth_map[y][x] = 0;
        }
        if(mode==="delete" && tmp_map[y][x]===0){
          mode = "zero";
        }
      }
    }
    for (var y = 0; y < height; y++) {
      tmp_map[y] = [];
      for (var x = 0; x < width; x++) {
        if(shield_depth_map[y][x] == 1) {
          tmp_map[y][x] = terrace_depth_map[y][x] + shield_depth_map[y][x];
        }else{
          tmp_map[y][x] = 0;
        }
      }
    }
    for (var x = 0; x < width; x++) {
      let mode = "zero";
      let first_contact_number = 0;
      for (var y = height-1; y >= 0; y--) {
        if(mode==="zero" && tmp_map[y][x]!==0){
          first_contact_number = tmp_map[y][x];
          mode = "first_contact";
        }
        if(mode==="first_contact" && tmp_map[y][x]!==first_contact_number){
          first_contact_number = 0;
          mode = "delete";
        }
        if(mode==="delete" && tmp_map[y][x]!==0){
          shield_depth_map[y][x] = 0;
        }
        if(mode==="delete" && tmp_map[y][x]===0){
          mode = "zero";
        }
      }
    }

    //for (var y = 0; y < height; y++) {
    //  for (var x = 0; x < width; x++) {
    //    hoge += ("  "+shield_depth_map[y][x]).substr(-2);
    //  }
    //  hoge += "\n";
    //}
    //hoge += "-----------------------------------------------------------------------------------------\n";

    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        terrace_depth_map[y][x] += shield_depth_map[y][x];
      }
    }
    // Modify litte y geometry such as "1 2 2 2 1"
    //                                    ~~~~~
    for (var y = 0; y < height-4; y++) {
      for (var x = 0; x < width; x++) {
        let a = Math.abs(terrace_depth_map[y  ][x] - terrace_depth_map[y][x]);
        let b = Math.abs(terrace_depth_map[y+1][x] - terrace_depth_map[y][x]);
        let c = Math.abs(terrace_depth_map[y+2][x] - terrace_depth_map[y][x]);
        let d = Math.abs(terrace_depth_map[y+3][x] - terrace_depth_map[y][x]);
        let e = Math.abs(terrace_depth_map[y+4][x] - terrace_depth_map[y][x]);
        if( a===0 && (b!==0 || c!==0 || d===0) && e===0 ){
          terrace_depth_map[y  ][x] = terrace_depth_map[y][x];
          terrace_depth_map[y+1][x] = terrace_depth_map[y][x];
          terrace_depth_map[y+2][x] = terrace_depth_map[y][x];
          terrace_depth_map[y+3][x] = terrace_depth_map[y][x];
          terrace_depth_map[y+4][x] = terrace_depth_map[y][x];
        }
      }
    }
    // Modify litte x geometry such as "1 2 1"
    //                                    ~
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width-1; x++) {
        let a = Math.abs(terrace_depth_map[y][x  ] - terrace_depth_map[y][x]);
        let b = Math.abs(terrace_depth_map[y][x+1] - terrace_depth_map[y][x]);
        let c = Math.abs(terrace_depth_map[y][x+2] - terrace_depth_map[y][x]);
        if( a===0 && b!==0 && c===0 ){
          terrace_depth_map[y][x  ] = terrace_depth_map[y][x];
          terrace_depth_map[y][x+1] = terrace_depth_map[y][x];
          terrace_depth_map[y][x+2] = terrace_depth_map[y][x];
        }
      }
    }
    for (var y = 0; y < height-3; y++) {
      for (var x = 0; x < width; x++) {
        let a = terrace_depth_map[y  ][x];
        let b = terrace_depth_map[y+1][x];
        let c = terrace_depth_map[y+2][x];
        let d = terrace_depth_map[y+3][x];
        if( a!==b && b===c && c!==d) {
          terrace_depth_map[y  ][x] = terrace_depth_map[y+1][x];
          terrace_depth_map[y+1][x] = terrace_depth_map[y+1][x];
          terrace_depth_map[y+2][x] = terrace_depth_map[y+1][x];
          terrace_depth_map[y+3][x] = terrace_depth_map[y+1][x];
        }
      }
    }
    for (var y = 0; y < height-3; y++) {
      for (var x = 0; x < width; x++) {
        let a = terrace_depth_map[y  ][x];
        let b = terrace_depth_map[y+1][x];
        let c = terrace_depth_map[y+2][x];
        if( a!==b && b!==c) {
          terrace_depth_map[y  ][x] = terrace_depth_map[y+1][x];
          terrace_depth_map[y+1][x] = terrace_depth_map[y+1][x];
          terrace_depth_map[y+2][x] = terrace_depth_map[y+1][x];
          terrace_depth_map[y+3][x] = terrace_depth_map[y+1][x];
        }
      }
    }

    //for (var y = 0; y < height; y++) {
    //  for (var x = 0; x < width; x++) {
    //    hoge += ("  "+terrace_depth_map[y][x]).substr(-2);
    //  }
    //  hoge += "\n";
    //}
    //console.log(hoge);

    return terrace_depth_map;
  };

  function MakeCliffAndBorderMap(depth_map) {
    let x_tmp_cliff_border = [];
    let y_tmp_cliff_border = [];
    let cliff_and_border_map = [];
    for(let y=0; y<depth_map.length; y++){
      x_tmp_cliff_border[y] = [];
      y_tmp_cliff_border[y] = [];
      cliff_and_border_map[y] = [];
      for(let x=0; x<depth_map[0].length; x++){
        x_tmp_cliff_border[y][x] = 0;
        y_tmp_cliff_border[y][x] = 0;
        cliff_and_border_map[y][x] = 0;
      }
    };
 
    // First, make cliff and y border map with only depth_map
    for(let y=0; y<depth_map.length-1; y++){
      for(let x=0; x<depth_map[0].length; x++){
        if(depth_map[y][x] < depth_map[y+1][x]){
          y_tmp_cliff_border[y+1][x] = 8;
        }else if(depth_map[y][x] > depth_map[y+1][x]){
          if( (y-2)>=0 ){
            y_tmp_cliff_border[y-2][x] =  2;
          }
          if( (y-1)>=0 ){
            y_tmp_cliff_border[y-1][x] = -5;
          }
          y_tmp_cliff_border[y][x] = -2;
        }
      }
    };
    // Second, make cliff x border map with depth_map and y_tmp_cliff_border
    for(let y=0; y<depth_map.length; y++){
      for(let x=0; x<depth_map[0].length-1; x++){
        if(depth_map[y][x] < depth_map[y][x+1]){
          x_tmp_cliff_border[y][x+1] = 4;
        }else if(depth_map[y][x] > depth_map[y][x+1]){
          x_tmp_cliff_border[y][x] = 6;
        }
        if( (y_tmp_cliff_border[y][x]<0) && (y_tmp_cliff_border[y][x]!==y_tmp_cliff_border[y][x+1]) ){
          //if( ( y_tmp_cliff_border[y][x]===-5 && y_tmp_cliff_border[y][x+1]===-2 ) || ( y_tmp_cliff_border[y][x]===-2 && y_tmp_cliff_border[y][x+1]===0 ) ){
          if( ( y_tmp_cliff_border[y][x]===-5 && y_tmp_cliff_border[y][x+1]===-2 ) || depth_map[y][x] > depth_map[y][x+1] ){
            // exceptions.
            // Do nothing.
          }else{
            x_tmp_cliff_border[y][x+1] = 4;
          }
        }
        if( (y_tmp_cliff_border[y][x+1]<0) && (y_tmp_cliff_border[y][x]!==y_tmp_cliff_border[y][x+1]) ){
          //if( ( y_tmp_cliff_border[y][x]===-2 && y_tmp_cliff_border[y][x+1]===-5 ) || ( y_tmp_cliff_border[y][x]===0 && y_tmp_cliff_border[y][x+1]===-2 ) ){
          if( ( y_tmp_cliff_border[y][x]===-2 && y_tmp_cliff_border[y][x+1]===-5 ) || depth_map[y][x] < depth_map[y][x+1] ){
            // exceptions.
            // Do nothing.
          }else{
            x_tmp_cliff_border[y][x] = 6;
          }
        }
      }
    };
 
    for(let y=0; y<depth_map.length; y++){
      for(let x=0; x<depth_map[0].length; x++){
        if( x_tmp_cliff_border[y][x] === 4 && y_tmp_cliff_border[y][x] === 8 ) {
          cliff_and_border_map[y][x] = 7;
        }else if( x_tmp_cliff_border[y][x] === 6 && y_tmp_cliff_border[y][x] === 8 ) {
          cliff_and_border_map[y][x] = 9;
        }else if( x_tmp_cliff_border[y][x] === 4 && y_tmp_cliff_border[y][x] === 2 ) {
          cliff_and_border_map[y][x] = 1;
        }else if( x_tmp_cliff_border[y][x] === 6 && y_tmp_cliff_border[y][x] === 2 ) {
          cliff_and_border_map[y][x] = 3;
        }else if( x_tmp_cliff_border[y][x] === 4 ) {
          cliff_and_border_map[y][x] = 4;
        }else if( x_tmp_cliff_border[y][x] === 6 ) {
          cliff_and_border_map[y][x] = 6;
        }else if( y_tmp_cliff_border[y][x] === 8 ) {
          cliff_and_border_map[y][x] = 8;
        }else if( y_tmp_cliff_border[y][x] === 2 ) {
          cliff_and_border_map[y][x] = 2;
        }
        // overwrite with cliff
        if( x_tmp_cliff_border[y][x]===4 && y_tmp_cliff_border[y][x] === -5 ) {
          cliff_and_border_map[y][x] = -4;
        }else if( x_tmp_cliff_border[y][x]===4 && y_tmp_cliff_border[y][x] === -2 ) {
          cliff_and_border_map[y][x] = -1;
        }else if( x_tmp_cliff_border[y][x]===6 && y_tmp_cliff_border[y][x] === -5 ) {
          cliff_and_border_map[y][x] = -6;
        }else if( x_tmp_cliff_border[y][x]===6 && y_tmp_cliff_border[y][x] === -2 ) {
          cliff_and_border_map[y][x] = -3;
        }else if( y_tmp_cliff_border[y][x] === -5 ) {
          cliff_and_border_map[y][x] = -5;
        }else if( y_tmp_cliff_border[y][x] === -2 ) {
          cliff_and_border_map[y][x] = -2;
        }
      }
    };
    for(let y=1; y<depth_map.length-1; y++){
      for(let x=1; x<depth_map[0].length-1; x++){
        let center  = cliff_and_border_map[y][x];
        let x_plus  = cliff_and_border_map[y][x+1];
        let x_minus = cliff_and_border_map[y][x-1];
        let y_plus  = cliff_and_border_map[y+1][x];
        let y_minus = cliff_and_border_map[y-1][x];
 
        if( (x_minus===1||x_minus===2) && (y_plus===1||y_plus===4) ){
          cliff_and_border_map[y][x] = 10;
        }else if( (x_plus===3||x_plus==2) && (y_plus===3||y_plus===6) ){
          cliff_and_border_map[y][x] = 11;
        }else if( (x_minus===7||x_minus===8) && (y_minus===7||y_minus===4) ){
          cliff_and_border_map[y][x] = 12;
        }else if( (x_plus===9||x_plus==8) && (y_minus===9||y_minus===6) ){
          cliff_and_border_map[y][x] = 13;
        }
      }
    };

    //var hoge = "";
    //for(let y=0; y<depth_map.length; y++){
    //  for(let x=0; x<depth_map[0].length; x++){
    //    hoge += depth_map[y][x];
    //  }
    //  hoge += "\n";
    //}
    //hoge += "----------------------------------------------------------------------------------------------------\n";
    //for(let y=0; y<depth_map.length; y++){
    //  for(let x=0; x<depth_map[0].length; x++){
    //    hoge += x_tmp_cliff_border[y][x];
    //  }
    //  hoge += "\n";
    //}
    //hoge += "----------------------------------------------------------------------------------------------------\n";
    //for(let y=0; y<depth_map.length; y++){
    //  for(let x=0; x<depth_map[0].length; x++){
    //    hoge += ("  "+cliff_and_border_map[y][x]).substr(-2);
    //  }
    //  hoge += "\n";
    //}
    //console.log(hoge);
    
    return cliff_and_border_map;
  };

  const border_index_to_pos = [ [1,10], [0,11], [1,11], [2,11], [0,10], undefined, [2,10], [0,9], [1,9], [2,9], [3,10], [4,10], [3,9], [4,9] ];
  const cliff_index_to_pos  = [ undefined, [5,10], [6,10], [7,10], [5,9], [6,9], [7,9] ];

  function MakeTreeMap(width, height, cliff_and_border_map, option) {
    let tree_map = [];
    for (let y = 0; y < height; y++) {
      tree_map[y] = [];
    }
    
    let x_relief  = option["TREE_DENSITY_X"];
    let y_relief  = option["TREE_DENSITY_Y"];
    let threshold = (100.0 - option["TREE_SIZE"]) / 100.0;
    
    let max = 0;
    let min = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let value = noise.perlin2(x / x_relief, y / y_relief);
        max = Math.max(value, max);
        min = Math.min(value, min);
        tree_map[y][x] = value;
      }
    }

    let normalize_factor = 1.0 / (max - min);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        tree_map[y][x] -= min;
        tree_map[y][x] *= normalize_factor;
        if(tree_map[y][x] > threshold || tree_map[y][x] < (1.0-threshold) ) {
          tree_map[y][x] = 1;
        }else{
          tree_map[y][x] = 0;
        }
      }
    }
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width-1; x++) {
        let z = 5;
        let index = (z*height + y)*width + x;
        if( target_data_map.data[index] === option["LIMIT_TREE"] ) {
          tree_map[y][x] = 0;
        }
        if( (cliff_and_border_map[y][x]===0 && cliff_and_border_map[y][x+1]!==0) || (cliff_and_border_map[y][x]!==0 && cliff_and_border_map[y][x+1]===0) || 
             cliff_and_border_map[y][x] < 0 || cliff_and_border_map[y][x+1] < 0 || cliff_and_border_map[y][x] > 6){
          tree_map[y][x] = 0;
        }
        if(cliff_and_border_map[y][x+1] < 0){
          tree_map[y][x+1] = 0;
        }
      }

    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width-1; x++) {
        let start_x, end_x;
        if(tree_map[y][x] === 1){
          start_x = x;
          while(tree_map[y][x] === 1 && x < width){
            end_x = x;
            x++;
          }
          let length = end_x - start_x + 1;
          let array = [];
          for(let i=0; i<length; i++){
            array.push((i+1)%2);
          }
          if(length%2 === 1) { // if length is odd
            let rand = $.random.nextInt(0,length-1);
            array.splice(rand, 0, 0);
          }
          let i=0;
          for(let x2=start_x; x2<=end_x; x2++){
            tree_map[y][x2] = array[i];
            i++;
          }
        }
      }
    };
    
    //let hoge = "";
    //for (let y = 0; y < height; y++) {
    //  for (let x = 0; x < width; x++) {
    //    hoge += String(tree_map[y][x]) + ",";
    //  }
    //  hoge += "\n";
    //}
    //console.log(hoge);
 
    return tree_map;
  };

  function MakeMap2dForField(cliff_and_border_map, tree_map) {
    let map2d = [];
    for(let y=0; y<cliff_and_border_map.length; y++){
      map2d[y] = [];
    }

    for(let y=0; y<cliff_and_border_map.length; y++){
      for(let x=0; x<cliff_and_border_map[0].length; x++){
        if(cliff_and_border_map[y][x]<0){
          map2d[y][x] = -2;
        }else if(cliff_and_border_map[y][x]>0){
          map2d[y][x] = -3;
        }else{
          map2d[y][x] = -1;
        }
      }
    };
    for(let y=1; y<cliff_and_border_map.length; y++){
      for(let x=0; x<cliff_and_border_map[0].length-1; x++){
        if(tree_map[y][x]==1){
          map2d[y-1][x]   = -3;
          map2d[y-1][x+1] = -3;
          map2d[y][x]     = -3;
          map2d[y][x+1]   = -3;
        }
      }
    };

    return map2d;
 
  };

  function MakeShadowForField(depth_map){
    let shadow_map = [];
    for(let y=0; y<depth_map.length; y++){
      shadow_map[y] = [];
      shadow_map[y][0] = 0;
      for(let x=1; x<depth_map[0].length; x++){
        if(depth_map[y][x-1] > depth_map[y][x]){
          shadow_map[y][x] = 1;
        } else {
          shadow_map[y][x] = 0;
        }
      }
    };

    return shadow_map;
  };

  function ApplyTiles(cliff_and_border_map, grass_map, walkable_object_map, unwalkable_1x1_object_map, unwalkable_1x2_object_map, wallpaper_1x1_map, wallpaper_1x2_map, tree_map, shadow_map, option){

    for(let y=0; y<target_data_map.height; y++) {
      for(let x=0; x<target_data_map.width; x++) {
        $.applySupponCTI([ 'add', 'abc', '0', '0', '1', '1', String(x), String(y) ], base_data_map );
      }
    }

    for(let y=0; y<cliff_and_border_map.length; y++){
      for(let x=0; x<cliff_and_border_map[0].length; x++){
        if(cliff_and_border_map[y][x]<0) {
          let cliff_pos_x = cliff_index_to_pos[Math.abs(cliff_and_border_map[y][x])][0];
          let cliff_pos_y = cliff_index_to_pos[Math.abs(cliff_and_border_map[y][x])][1];
          $.applySupponCTI([ 'add', 'abc', String(cliff_pos_x), String(cliff_pos_y), '1', '1', String(x), String(y) ], base_data_map);
        //}else if(cliff_and_border_map[y][x]>0) {
        }else {
          let border_pos_x = border_index_to_pos[cliff_and_border_map[y][x]][0];
          let border_pos_y = border_index_to_pos[cliff_and_border_map[y][x]][1];
          $.applySupponCTI([ 'add', 'abc', String(border_pos_x), String(border_pos_y), '1', '1', String(x), String(y) ], base_data_map);
        }
      }
    };

    if(option["ADD_A_OBJ"]){
      if(grass_tiles_num!=0){
        for(let y=0; y<target_data_map.height; y++) {
          for(let x=0; x<target_data_map.width; x++) {
            if(grass_map[y][x] != 0 && cliff_and_border_map[y][x]===0) {
              $.applySupponCTI([ 'autoadd', 'abc', String(grass_map[y][x]-1), '1', '1', '1', String(x), String(y) ], base_data_map );
            }
          }
        }
      }
    }

    if(option["ADD_W_OBJ"]){
      for(let y=0; y<target_data_map.height; y++) {
        for(let x=0; x<target_data_map.width; x++) {
          if(walkable_object_map[y][x] != 0 && cliff_and_border_map[y][x]===0) {
            $.applySupponCTI(['add', 'abc', String(walkable_object_map[y][x]-1), '2', '1', '1', String(x), String(y)], base_data_map); 
          }
        }
      }
    }

    if(option["ADD_U_OBJ"]){
      for(let y=0; y<target_data_map.height; y++) {
        for(let x=0; x<target_data_map.width; x++) {
          if(unwalkable_1x1_object_map[y][x] != 0 && cliff_and_border_map[y][x]===0) {
            $.applySupponCTI([ 'add', 'abc', String(unwalkable_1x1_object_map[y][x]-1), '3', '1', '1', String(x), String(y) ], base_data_map);
          }
        }
      }
      for(let y=target_data_map.height-1; y>=0; y--) {
        for(let x=0; x<target_data_map.width; x++) {
          if(unwalkable_1x2_object_map[y][x] != 0 && cliff_and_border_map[y][x]===0) {
            $.applySupponCTI([ 'add', 'abc', String(unwalkable_1x2_object_map[y][x]-1), '4', '1', '2', String(x), String(y) ], base_data_map);
          }
        }
      }
    };

    if(option["ADD_WALL"]){
      if(wallpaper_1x1_tiles_num!=0 || wallpaper_1x2_tiles_num!=0){
        for(let y=target_data_map.height-1; y>=0; y--) {
          for(let x=0; x<target_data_map.width; x++) {
            if(wallpaper_1x1_map[y][x] != 0) {
              $.applySupponCTI([ 'add', 'abc', String(wallpaper_1x1_map[y][x]-1), '6', '1', '1', String(x), String(y) ], base_data_map);
            }
          }
        }
 
        for(let y=target_data_map.height-1; y>=0; y--) {
          for(let x=0; x<target_data_map.width; x++) {
            if(wallpaper_1x2_map[y][x] != 0) {
              $.applySupponCTI([ 'add', 'abc', String(wallpaper_1x2_map[y][x]-1), '7', '1', '2', String(x), String(y) ] , base_data_map);
            }
          }
        }
      }
    };
 
    if(option["ADD_TREE"]){
      let y=0;
      for(let x=0; x<tree_map[0].length; x++){
        if(tree_map[y][x]===1) {
          $.applySupponCTI([ 'add', 'abc', '8', '10', '2', '1', String(x), String(y) ], base_data_map);
        }
      }
      for(let y=1; y<tree_map.length; y++){
        for(let x=0; x<tree_map[0].length; x++){
          if(tree_map[y][x]===1) {
            $.applySupponCTI([ 'add', 'abc', '8', '9', '2', '2', String(x), String(y-1) ], base_data_map);
          }
        }
      }
    };

    for(let y=0; y<target_data_map.height; y++) {
      for(let x=0; x<target_data_map.width; x++) {
        if(shadow_map[y][x] === 1) {
          var z = 4;
          var index = (z*target_data_map.height + y)*target_data_map.width + x;
          target_data_map.data[index] = 5;
        }
      }
    };

  };

  function ConsoleOut(json) {
    var data = JSON.stringify(json);
    console.clear();
    console.log(data);
  }
})(KURAGE.SemiAutoDungeon);
