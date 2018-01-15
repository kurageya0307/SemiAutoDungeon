//=============================================================================
// KURAGE_SemiAutoDungeon.js
// Author    : KURAGE
// Date      : 2018/01/11
// Update    : 2018/01/11
// Version   : v1.0.0
//=============================================================================

//=============================================================================
/*:
 * @plugindesc v1.0.0 簡易に作成したマップから自然なダンジョンを生成します。
 * @author KURAGE
 *
 * @param 素材マップID
 * @desc 素材を配置したマップのマップIDをコンマ区切りで指定します。スペースは無視されます。
 * 0を指定することはできません。
 * @default 1, 2, 3
 *
 * @param 通行不可能オブジェクト制限リージョンID
 * @desc このリージョンIDを設定したタイルには通行不可能なオブジェクトを配置しません。
 * ダンジョンの出入り口に設定することで「入った途端にオブジェクトの上に乗ってしまって移動できなくなる」現象を防止します。
 * @default 1
 *
 * @help 
 *
 *-----------------------------------------------------------------------------
 * Introduction
 *-----------------------------------------------------------------------------
 * 素材を配置したマップと簡易に作成したマップから，
 * 以下のアルゴリズムに基いて自然なダンジョンを生成します。
 * 1.　角を削る。
 * 2.　道を拡げ，ガタガタにする。
 * 3.　通行可能なオブジェ・通行不可能なオブジェ・壁の飾りをランダムに配置する。
 * 4.　影をつける。
 * 
 *-----------------------------------------------------------------------------
 * Usage
 *-----------------------------------------------------------------------------
 * 以下の二種類のマップを作成してください。
 * 1.　素材を配置したマップ
 * 2.　通路を直線で適当につないだマップ
 *
 * 1.のマップは以下の規格のとおり素材を配置してください。
 * Y座標　：　素材内容
 * 0　　　：　「床」「壁」「天井」
 * 1　　　：　通行可能でオートタイルで塗りつぶしするタイプの床（例：「床の苔」「床の汚れ」「毒の沼」など）
 * 2　　　：　通行可能で床に置くタイプのオブジェクト（例：「砂利」「草」など）
 * 3　　　：　通行不可能で床に置くタイプの1x1サイズのオブジェクト（例：「岩」「掘られた床」など）
 * 4～5 　：　通行不可能で床に置くタイプの1x2サイズのオブジェクト（例：「大きな岩」「石像」など）
 * 6　　　：　1x1サイズの壁の飾り（例：「壁の苔」など）
 * 7～8 　：　1x2サイズの壁の飾り（例：「壁のツタ」など）
 *
 * 2.のマップは通路を直線で迷路状に繋いでください。
 * 【重要】通路の幅は３，通路と通路の間の何もない空間の幅は６以上を推奨します。
 *　　　        　　~~~~                                  ~~~~~~~~
 * テストプレイを行い，どこかのマップにて以下のプラグインコマンドを実行してください。
 * 「KURAGE_SemiAutoDungeon」
 * （F8キーを押してコンソール画面を開くとダンジョン生成の進行具合を確認できます。）
 *
 * RPGツクールMVを一度終了し，dataフォルダに作成された「_Map***.json」をMap***.jsonにリネームしてください。
 * Windows環境の場合，同梱のバッチファイル「__SwapMap.bat」をダブルクリックすると
 * 全てのファイルが自動でリネームされます。
 *
 * 再度RPGツクールMVを起動すると自動生成されたダンジョンが編集可能になっています。
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
 * このプラグインはSuppon氏の作成した「SupponChangeTileId.js」のソースコードを流用しております。
 * また，Triacontane氏の作成した「GraphicalDesignMode.js」のソースコードも流用しております。
 * 素敵なプラグインを作成いただいた両氏に感謝いたします。
 *
 *-----------------------------------------------------------------------------
 * Others
 *-----------------------------------------------------------------------------
 * 
 * v1.0.0 - 2018/01/11 : 
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
  $.parent_ids = $.params['素材マップID'].split(",").map(function(v) {return Number(v);} );
//console.log($.parent_ids)
  $.forbidden_region = $.params['通行不可能オブジェクト制限リージョンID'];
  
  $.random = null;
  $.map_and_parent_pair = [];

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
            var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, '/data/');
            if (path.match(/^\/([A-Z]\:)/)) {
                path = path.slice(1);
            }
            return decodeURIComponent(path);
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
   } else if($.map_and_parent_pair.length > 0){
     this.updateForBaseMapDataLoad();
     //console.log($.map_and_parent_pair[0]);
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
         if($.parent_ids.indexOf(map_infos[key].parentId) >= 0){
           $.map_and_parent_pair.push([map_infos[key].id, map_infos[key].parentId]);
         }
       }
     }
     //console.log($.map_and_parent_pair);
     this.load_map_infos = false;
     $gameTemp.loadAtOnce = true;
   }
   if(!map_infos){
     return;
   }
 };

 window.base_data_map = null;
 window.target_data_map = null;
 Game_Map.prototype.updateForBaseMapDataLoad = function(){
   if($gameTemp.loadAtOnce) {
     // Make random with map id as seed.
     $.random = new Random($.map_and_parent_pair[0][0]);

     // Load only one time
     var target_file_name = 'Map%1.json'.format($.map_and_parent_pair[0][0].padZero(3));
     target_data_map = null;
     DataManager.loadDataFile('target_data_map', target_file_name);
     var base_file_name = 'Map%1.json'.format($.map_and_parent_pair[0][1].padZero(3));
     base_data_map = null;
     DataManager.loadDataFile('base_data_map', base_file_name);
     $gameTemp.loadAtOnce = false;
     //console.log("Load " + target_file_name);
   }   
   if(base_data_map && target_data_map){
     console.log('Create _Map%1'.format($.map_and_parent_pair[0][0].padZero(3)) );
     // if load is completed
     //console.log(base_data_map);
     //console.log(target_data_map);

     PrepareTiles();

     LoadTargetMap();
     SearchCorner();
     MakeLineBuffer();
     ExtendXPassages();
     ExtendYPassages();
     MakeWallAndCeil();
     MakeShadow();

     MakeGrass();
     MakeObject();
     MakeWallpaper();

     CreateFloorWallAndCeil();

     var output_file_name = '_Map%1.json'.format($.map_and_parent_pair[0][0].padZero(3));
     StorageManager.saveToLocalDataFile(output_file_name, target_data_map) 

     console.log('Map%1 OK!'.format($.map_and_parent_pair[0][0].padZero(3)) );
     $.map_and_parent_pair.shift();
     if($.map_and_parent_pair.length <= 0) {
       console.log("All dungeons are created!!");
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
 var walable_1x1_object_tiles_num = 0;
 var unwalable_1x1_object_tiles_num = 0;
 var unwalable_1x2_object_tiles_num = 0;
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
   walable_1x1_object_tiles_num = 0;
   for(let x=0; x<base_data_map.width; x++) {
     let tmp = 0;
     for (let z=0; z<6; z++){
       let index = (z*base_data_map.height + y)*base_data_map.width + x;
       tmp += base_data_map.data[index];
     }
     if(tmp==0) break;
     walable_1x1_object_tiles_num++;
   };

   // Read unwalkable 1x1 object tiles
   y = 3;
   unwalable_1x1_object_tiles_num = 0;
   for(let x=0; x<base_data_map.width; x++) {
     let tmp = 0;
     for (let z=0; z<6; z++){
       let index = (z*base_data_map.height + y)*base_data_map.width + x;
       tmp += base_data_map.data[index];
     }
     if(tmp==0) break;
     unwalable_1x1_object_tiles_num++;
   };

   // Read unwalkable 1x2 object tiles
   y            = 4;
   let y_plus_1 = 5;
   unwalable_1x2_object_tiles_num = 0;
   for(let x=0; x<base_data_map.width; x++) {
     let tmp = 0;
     for (let z=0; z<6; z++){
       let index = (z*base_data_map.height + y)*base_data_map.width + x;
       tmp += base_data_map.data[index];
       index = (z*base_data_map.height + y_plus_1)*base_data_map.width + x;
       tmp += base_data_map.data[index];
     }
     if(tmp==0) break;
     unwalable_1x2_object_tiles_num++;
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
   //console.log(walable_1x1_object_tiles_num)
   //console.log(unwalable_1x1_object_tiles_num)
   //console.log(unwalable_1x2_object_tiles_num)
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
 var map2d = [];
 function LoadTargetMap() {
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
              [     -1,     -1,     -1,     -3,     -3,NO_MASK,NO_MASK],
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
 function SearchCorner() {
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
 function MakeLineBuffer() {
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
 function ExtendXPassages() {
   for(let i=0; i<x_buffer.length; i++) {
     var j = x_buffer[i].length - 1;
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
       x_array.lengths[0] += 1;
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
 function ExtendYPassages() {
   for(let i=0; i<y_buffer.length; i++) {
     var j = y_buffer[i].length - 1;
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

 function MakeWallAndCeil() {
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

 var shadow_map = [];
 function MakeShadow() {
   for(let y=0; y<target_data_map.height; y++) {
     shadow_map[y] = [];
     for(let x=0; x<target_data_map.width; x++) {
       shadow_map[y][x] = 0;
     }
   }
   for(let y=0; y<target_data_map.height; y++) {
     for(let x=target_data_map.width-1; x>=1; x--) {
       if( (map2d[y][x]==-1 || map2d[y][x]==1) && (map2d[y][x-1]==-2 || map2d[y][x-1]==-3) ){
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
 };

 var grass_map = [];
 const REGION_X_GRASS = 10;
 const REGION_Y_GRASS = 10;
 const MARGIN_X_GRASS = 2;
 const MARGIN_Y_GRASS = 2;
 const ITERATION_NUM_GRASS = 100;
 const MIN_LENGTH_GRASS = 5;
 const MAX_LENGTH_GRASS = 15;
 function MakeGrass() {
   var block_length_x = REGION_X_GRASS + MARGIN_X_GRASS;
   var block_length_y = REGION_Y_GRASS + MARGIN_Y_GRASS;
   for(let y=0; y<target_data_map.height; y++) {
     grass_map[y] = [];
     for(let x=0; x<target_data_map.width; x++) {
       grass_map[y][x] = 0;
     }
   }
   if(grass_tiles_num==0){
     return;
   }

   var region_x_num = Math.ceil(target_data_map.width /block_length_x);
   var region_y_num = Math.ceil(target_data_map.height/block_length_y);
   for(let j=0; j<region_y_num; j++) {
     for(let i=0; i<region_x_num; i++) {
       if($.random.nextInt(0,1) == 0) {
         var rand_grass_tile_id = $.random.nextInt(1, grass_tiles_num);
         //var rand_grass_tile_id = $.random.nextInt(1, 2);
         for(let k=0; k<ITERATION_NUM_GRASS; k++) {
           var x = $.random.nextInt(i*block_length_x + MARGIN_X_GRASS, (i+1)*block_length_x - MARGIN_X_GRASS);
           if( (x+1)>=target_data_map.width ) continue;
           var y = $.random.nextInt(j*block_length_y + MARGIN_Y_GRASS, (j+1)*block_length_y - MARGIN_Y_GRASS);
           if( (y+1)>=target_data_map.height ) continue;
           if( (map2d[y][x]     == 1 || map2d[y][x]     == -1) &&
               (map2d[y][x+1]   == 1 || map2d[y][x+1]   == -1) &&
               (map2d[y+1][x]   == 1 || map2d[y+1][x]   == -1) &&
               (map2d[y+1][x+1] == 1 || map2d[y+1][x+1] == -1) ) {
             grass_map[y][x]     = rand_grass_tile_id;
             grass_map[y][x+1]   = rand_grass_tile_id;
             grass_map[y+1][x]   = rand_grass_tile_id;
             grass_map[y+1][x+1] = rand_grass_tile_id;

             var snake_length = $.random.nextInt(MIN_LENGTH_GRASS, MAX_LENGTH_GRASS);
             for(let s=0; s<snake_length; s++) {
               var next_x = x;
               var next_y = y;
               var random_direction = $.random.nextInt(1,8);
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

   //var fuga = "";
   //for(let y=0; y<target_data_map.height; y++) {
   //  for(let x=0; x<target_data_map.width; x++) {
   //    fuga += String(grass_map[y][x]);
   //  }
   //  fuga += "\n";
   //}
   //console.log(fuga);
   
 };

 var walkable_object_map = [];
 var unwalkable_1x1_object_map = [];
 var unwalkable_1x2_object_map = [];
 const REGION_X_OBJECT = 7;
 const REGION_Y_OBJECT = 7;
 const ITERATION_NUM_OBJECT = 100;
 const MIN_NUM_WALKABLE_OBJECT = 1;
 const MAX_NUM_WALKABLE_OBJECT = 1;
 const MIN_NUM_UNWALKABLE_OBJECT = 1;
 const MAX_NUM_UNWALKABLE_OBJECT = 1;
 function MakeObject() {
   for(let y=0; y<target_data_map.height; y++) {
     walkable_object_map[y] = [];
     unwalkable_1x1_object_map[y] = [];
     unwalkable_1x2_object_map[y] = [];
     for(let x=0; x<target_data_map.width; x++) {
       walkable_object_map[y][x] = 0;
       unwalkable_1x1_object_map[y][x] = 0;
       unwalkable_1x2_object_map[y][x] = 0;
     }
   }

   if(walkable_object_num!=0){
     var region_x_num = Math.ceil(target_data_map.width /REGION_X_OBJECT);
     var region_y_num = Math.ceil(target_data_map.height/REGION_Y_OBJECT);
     for(let j=0; j<region_y_num; j++) {
       for(let i=0; i<region_x_num; i++) {
         var walkable_object_num = $.random.nextInt(MIN_NUM_WALKABLE_OBJECT, MAX_NUM_WALKABLE_OBJECT);
         for(let k=0; k<walkable_object_num; k++) {
           for(var ite=0; ite<ITERATION_NUM_OBJECT; ite++) {
             var x = $.random.nextInt(i*REGION_X_OBJECT, (i+1)*REGION_X_OBJECT);
             if( (x+1)>=target_data_map.width ) continue;
             var y = $.random.nextInt(j*REGION_Y_OBJECT, (j+1)*REGION_Y_OBJECT);
             if( (y+1)>=target_data_map.height ) continue;
             if(map2d[y][x] == 1 || map2d[y][x] == -1) break;
           };
           if(ite==ITERATION_NUM_OBJECT) continue;
           var rand_object_tile_id = $.random.nextInt(1, walable_1x1_object_tiles_num);
           walkable_object_map[y][x] = rand_object_tile_id;
         }
       }
     }
   }

   if(unwalable_1x1_object_tiles_num!=0 || unwalable_1x2_object_tiles_num!=0){
     for(let j=0; j<region_y_num; j++) {
       for(let i=0; i<region_x_num; i++) {
         var unwalkable_object_num = $.random.nextInt(MIN_NUM_UNWALKABLE_OBJECT, MAX_NUM_UNWALKABLE_OBJECT);
         for(let k=0; k<unwalkable_object_num; k++) {
           for(var ite=0; ite<ITERATION_NUM_OBJECT; ite++) {
             var x = $.random.nextInt(i*REGION_X_OBJECT, (i+1)*REGION_X_OBJECT);
             if( (x+1)>=target_data_map.width ) continue;
             var y = $.random.nextInt(j*REGION_Y_OBJECT, (j+1)*REGION_Y_OBJECT);
             if( (y+1)>=target_data_map.height ) continue;
             let z = 5;
             let index = (z*target_data_map.height + y)*target_data_map.width + x;
             if( target_data_map.data[index] == $.forbidden_region ) continue;
             if((map2d[y][x] == 1 && $.random.nextInt(0,2)<2) || map2d[y][x] == -1) break;
           };
           if(ite>=100) continue;
           if(y-1<0) continue;
           if(unwalable_1x1_object_tiles_num!=0 && unwalable_1x2_object_tiles_num==0){
             var rand_object_tile_id = $.random.nextInt(1, unwalable_1x1_object_tiles_num);
             unwalkable_1x1_object_map[y][x] = rand_object_tile_id;
           }else if(unwalable_1x1_object_tiles_num==0 && unwalable_1x2_object_tiles_num!=0){
             var rand_object_tile_id = $.random.nextInt(1, unwalable_1x2_object_tiles_num);
             unwalkable_1x2_object_map[y-1][x] = rand_object_tile_id;
           }else {
             if($.random.nextInt(0, 4) < 4) {
               var rand_object_tile_id = $.random.nextInt(1, unwalable_1x1_object_tiles_num);
               unwalkable_1x1_object_map[y][x] = rand_object_tile_id;
             }else{
               var rand_object_tile_id = $.random.nextInt(1, unwalable_1x2_object_tiles_num);
               unwalkable_1x2_object_map[y-1][x] = rand_object_tile_id;
             }
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

   //var fuga = "";
   //for(let y=0; y<target_data_map.height; y++) {
   //  for(let x=0; x<target_data_map.width; x++) {
   //    fuga += String(walkable_object_map[y][x]);
   //  }
   //  fuga += "\n";
   //}
   //console.log(fuga);
 };

 var wallpaper_1x1_map = [];
 var wallpaper_1x2_map = [];
 const REGION_X_WALLPAPER = 5;
 const REGION_Y_WALLPAPER = 5;
 const ITERATION_NUM_WALLPAPER = 100;
 const MIN_NUM_WALLPAPER = 1;
 const MAX_NUM_WALLPAPER = 1;
 function MakeWallpaper() {
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

   var region_x_num = Math.ceil(target_data_map.width /REGION_X_WALLPAPER);
   var region_y_num = Math.ceil(target_data_map.height/REGION_Y_WALLPAPER);
   for(let j=0; j<region_y_num; j++) {
     for(let i=0; i<region_x_num; i++) {
       var wallpaper_num = $.random.nextInt(MIN_NUM_WALLPAPER, MAX_NUM_WALLPAPER);
       for(let k=0; k<wallpaper_num; k++) {
         for(var ite=0; ite<100; ite++) {
           var x = $.random.nextInt(i*REGION_X_WALLPAPER, (i+1)*REGION_X_WALLPAPER);
           if( (x+1)>=target_data_map.width ) continue;
           var y = $.random.nextInt(j*REGION_Y_WALLPAPER, (j+1)*REGION_Y_WALLPAPER);
           if( (y+1)>=target_data_map.height ) continue;
           if( y-1<0 ) continue;
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
     }
   }

   //var fuga = "";
   //for(let y=0; y<target_data_map.height; y++) {
   //  for(let x=0; x<target_data_map.width; x++) {
   //    fuga += String(walkable_object_map[y][x]);
   //  }
   //  fuga += "\n";
   //}
   //console.log(fuga);
 };

 function CreateFloorWallAndCeil() {
   for(let y=0; y<target_data_map.height; y++) {
     for(let x=0; x<target_data_map.width; x++) {
       if(map2d[y][x] == -3) {
         $.applySupponCTI([ 'auto', 'abc', '2', '0', '1', '1', String(x), String(y) ], base_data_map);
       }else if(map2d[y][x] == -2) {
         $.applySupponCTI([ 'auto', 'abc', '1', '0', '1', '1', String(x), String(y) ], base_data_map);
       }else if(map2d[y][x] == -1) {
         $.applySupponCTI([ 'auto', 'abc', '0', '0', '1', '1', String(x), String(y) ], base_data_map);
       }
     }
   }

   if(grass_tiles_num!=0){
     for(let y=0; y<target_data_map.height; y++) {
       for(let x=0; x<target_data_map.width; x++) {
         if(grass_map[y][x] != 0) {
           $.applySupponCTI([ 'autoadd', 'abc', String(grass_map[y][x]-1), '1', '1', '1', String(x), String(y) ], base_data_map );
         }
       }
     }
   }

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

   for(let y=0; y<target_data_map.height; y++) {
     for(let x=0; x<target_data_map.width; x++) {
       if(walkable_object_map[y][x] != 0) {
         $.applySupponCTI(['add', 'abc', String(walkable_object_map[y][x]-1), '2', '1', '1', String(x), String(y)], base_data_map); 
       }
     }
   }

   for(let y=0; y<target_data_map.height; y++) {
     for(let x=0; x<target_data_map.width; x++) {
       if(unwalkable_1x1_object_map[y][x] != 0) {
         $.applySupponCTI([ 'add', 'abc', String(unwalkable_1x1_object_map[y][x]-1), '3', '1', '1', String(x), String(y) ], base_data_map);
       }
     }
   }

   for(let y=target_data_map.height-1; y>=0; y--) {
     for(let x=0; x<target_data_map.width; x++) {
       if(unwalkable_1x2_object_map[y][x] != 0) {
         $.applySupponCTI([ 'add', 'abc', String(unwalkable_1x2_object_map[y][x]-1), '4', '1', '2', String(x), String(y) ], base_data_map);
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

})(KURAGE.SemiAutoDungeon);
