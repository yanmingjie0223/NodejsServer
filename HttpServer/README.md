## 安装依赖软件
- mysql + redis + nginx + node
    - mysql
        - 8.0.41(latest8.0.34)
		- 数据库属性
			- utf8mb4 -- UTF-8 Unicode
			- utf8mb4_0900_ai_ci
    - redis
        - 7.2.5
    - nginx
        - 1.20.1(latest1.27.4)
        - ssl配置
    - node
        - 22.19.0(lts)
        - node 16后不需要make安装直接配置路径即可

## 运行
- build_data.bat 打包更新表配置数据
- build_dev.bat 编译构建运行版本
- build_protocol.bat 构建协议生成代码
- build_release.bat 构建发布版本

## 调试
- build后debug启动dev-debug即可调试断点ts