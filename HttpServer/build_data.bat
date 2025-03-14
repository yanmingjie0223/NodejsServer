set curPath=%~dp0
set WORKSPACE=.\

set LUBAN_DLL=%WORKSPACE%\tools\Luban\Luban.dll
set CONF_ROOT=%WORKSPACE%..\Design\Datas

dotnet %LUBAN_DLL% ^
    -t server ^
    -c typescript-bin ^
    -d bin  ^
    --conf %CONF_ROOT%\__zconfig__.conf ^
    -x outputCodeDir=%WORKSPACE%src\luban\lubancode ^
    -x outputDataDir=%WORKSPACE%src\luban\lubandata

pause