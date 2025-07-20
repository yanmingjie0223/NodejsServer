@echo off
setlocal enabledelayedexpansion
set CUR_PATH=%~dp0
set BUILD_PATH="%CUR_PATH%build\"

rd /q /s !BUILD_PATH!

call npm run build

xcopy /s /i /y %CUR_PATH%src\luban\lubandata %BUILD_PATH%src\luban\lubandata
copy %CUR_PATH%ecosystem.config.js %BUILD_PATH%ecosystem.config.js

:toEnd
echo end
pause