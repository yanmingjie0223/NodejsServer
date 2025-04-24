@echo off
setlocal enabledelayedexpansion
set CUR_PATH=%~dp0
set BUILD_PATH="%CUR_PATH%build\"

rd /q /s !BUILD_PATH!

call npx tsc --sourceMap
xcopy /s /i /y %CUR_PATH%src\luban\lubandata %BUILD_PATH%src\luban\lubandata

:toEnd
echo end
pause