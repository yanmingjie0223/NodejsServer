@echo off
setlocal enabledelayedexpansion
set curPath=%~dp0
set releasePath="%curPath%release\"
set distPath="%curPath%dist\"

del /q /s !releasePath!
del /q /s !distPath!

call npx tsc
mkdir %distPath%src\serverConfig
copy %curPath%src\serverConfig\config-release.json %distPath%src\serverConfig\config.json
xcopy /s /i /y %curPath%src\luban\lubandata %distPath%src\luban\lubandata

xcopy /s /i /y %distPath% %releasePath%dist
copy %curPath%index.js %releasePath%dist\index.js
copy %curPath%ecosystem.config.js %releasePath%ecosystem.config.js
copy %curPath%package.json %releasePath%package.json

:toEnd
echo end
pause