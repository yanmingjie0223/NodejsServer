@echo off
setlocal enabledelayedexpansion
set curPath=%~dp0
set releasePath="%curPath%release\"
set buildPath="%curPath%build\"

rd /q /s !releasePath!
rd /q /s !buildPath!

call npm run release

xcopy /s /i /y %curPath%src\luban\lubandata %buildPath%src\luban\lubandata
xcopy /s /i /y %buildPath% %releasePath%
copy %curPath%ecosystem.config.js %releasePath%ecosystem.config.js
copy %curPath%package.json %releasePath%package.json
copy %curPath%.env.production %releasePath%.env.production

:toEnd
echo end
pause