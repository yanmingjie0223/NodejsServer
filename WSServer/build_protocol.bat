@echo off
setlocal enabledelayedexpansion
set CUR_PATH=%~dp0
set PROTOC=.\tools\protoc\bin\protoc.exe
set PLUGIN=.\node_modules\.bin\protoc-gen-ts_proto.cmd
set OUT_DIR=.\src\protocol
set PROTO_DIR=.\protocol

if not exist "%CUR_PATH%node_modules" (
    echo "{npm install} please use node 16.*.*"
	npm install
)

if not exist "%OUT_DIR%" (
	mkdir "%OUT_DIR%"
)

REM 执行编译
"%PROTOC%" ^
    --plugin=protoc-gen-ts_proto="%PLUGIN%" ^
    --ts_proto_out="%OUT_DIR%" ^
    --ts_proto_opt=outputServices=grpc-js,env=node,esModuleInterop=true ^
    --proto_path="%PROTO_DIR%" ^
    "%PROTO_DIR%\*.proto"

if exist "%OUT_DIR%" (
    cd "%OUT_DIR%"
	for %%i in (*.meta) do (
		set name=%%i
		set tsName=!name:~0,-5!
		if not exist "%OUT_DIR%\!tsName!" (
			del /q /s !name!
		)
	)
)

echo end
pause
