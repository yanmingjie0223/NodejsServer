@echo off
setlocal enabledelayedexpansion
set CUR_PATH=%~dp0
set BUILD_PATH="%CUR_PATH%build\"

rd /q /s !BUILD_PATH!

call npx tsc
xcopy /s /i /y %CUR_PATH%src\luban\lubandata %BUILD_PATH%\luban\lubandata

:toEnd
echo end
pause