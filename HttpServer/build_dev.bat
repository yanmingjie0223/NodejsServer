@echo off
setlocal enabledelayedexpansion
set curPath=%~dp0
set buildPath="%curPath%build\"

rd /q /s !buildPath!

call npm run build

xcopy /s /i /y %curPath%src\luban\lubandata %buildPath%src\luban\lubandata
copy %curPath%package.json %buildPath%package.json

:toEnd
echo end
pause