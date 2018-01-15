@echo off

setlocal enabledelayedexpansion
 
rem txtファイルを一つずつ%%aに代入してループを回す
for %%a in (_Map*.json) do (
  rem %%aに代入されたファイル名をコマンドプロンプトに書き出す
  set target_name=%%a
  set base_name=!target_name:_=!
  set tmp_name=%%a.tmp
  rem echo !base_name!
  rem echo !target_name!
  rem echo !tmp_name!
  move !base_name! !tmp_name!
  move !target_name! !base_name!
  move !tmp_name! !target_name!
)
pause