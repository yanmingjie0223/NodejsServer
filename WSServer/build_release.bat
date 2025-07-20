@echo off
setlocal enabledelayedexpansion
set CUR_PATH=%~dp0
set BUILD_PATH="%CUR_PATH%build\"
set RELEASE_PATH="%CUR_PATH%release\"

rd /q /s !RELEASE_PATH!
rd /q /s !BUILD_PATH!

call npm run release

xcopy /s /i /y "%CUR_PATH%build\src" "%RELEASE_PATH%src"
xcopy /s /i /y %CUR_PATH%src\luban\lubandata %RELEASE_PATH%src\luban\lubandata
copy %CUR_PATH%ecosystem.config.js %RELEASE_PATH%ecosystem.config.js
copy %CUR_PATH%package.json %RELEASE_PATH%package.json
copy %CUR_PATH%.env.production %RELEASE_PATH%.env.production

:toEnd
echo end
pause