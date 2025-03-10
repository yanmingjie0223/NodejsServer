@echo off
setlocal enabledelayedexpansion
set curPath=%~dp0
set buildPath="%curPath%build\"
set distPath="%curPath%dist\"

del /q /s !buildPath!
del /q /s !distPath!

call npx tsc
mkdir %distPath%src\serverConfig
copy %curPath%src\serverConfig\config.json %distPath%src\serverConfig\config.json
xcopy /s /i /y %curPath%src\lubandata %distPath%src\lubandata

xcopy /s /i /y %distPath% %buildPath%dist
copy %curPath%index.js %buildPath%dist\index.js
copy %curPath%ecosystem.config.js %buildPath%ecosystem.config.js
copy %curPath%package.json %buildPath%package.json

:toEnd
echo end
pause