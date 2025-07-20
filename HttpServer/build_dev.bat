@echo off
setlocal enabledelayedexpansion
set curPath=%~dp0
set buildPath="%curPath%build\"
set distPath="%curPath%dist\"

rd /q /s !buildPath!
rd /q /s !distPath!

call npm run build

xcopy /s /i /y %curPath%src\luban\lubandata %distPath%src\luban\lubandata
xcopy /s /i /y %distPath% %buildPath%dist
copy %curPath%index.js %buildPath%dist\index.js
copy %curPath%ecosystem.config.js %buildPath%ecosystem.config.js
copy %curPath%package.json %buildPath%package.json

:toEnd
echo end
pause