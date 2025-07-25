@echo off
setlocal enabledelayedexpansion
set curPath=%~dp0
set releasePath="%curPath%release\"
set distPath="%curPath%dist\"

rd /q /s !releasePath!
rd /q /s !distPath!

call npm run release

xcopy /s /i /y %curPath%src\luban\lubandata %distPath%src\luban\lubandata
xcopy /s /i /y %distPath% %releasePath%dist
copy %curPath%index.js %releasePath%dist\index.js
copy %curPath%ecosystem.config.js %releasePath%ecosystem.config.js
copy %curPath%package.json %releasePath%package.json
copy %curPath%.env.production %releasePath%.env.production

:toEnd
echo end
pause