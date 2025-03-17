@echo off
setlocal enabledelayedexpansion
set curPath=%~dp0
set buildPath="%curPath%build\"
set distPath="%curPath%dist\"

del /q /s !buildPath!
del /q /s !distPath!

call npx tsc --sourceMap
mkdir %distPath%src\server-config
copy %curPath%src\server-config\config.json %distPath%src\server-config\config.json
xcopy /s /i /y %curPath%src\luban\lubandata %distPath%src\luban\lubandata

xcopy /s /i /y %distPath% %buildPath%dist
copy %curPath%index.js %buildPath%dist\index.js
copy %curPath%ecosystem.config.js %buildPath%ecosystem.config.js
copy %curPath%package.json %buildPath%package.json

:toEnd
echo end
pause