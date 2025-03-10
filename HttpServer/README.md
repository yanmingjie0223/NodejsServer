## 安装依赖软件
- mysql + redis + nginx + node
    - mysql
        - 8.0.41(latest8.0.34)
    - redis
        - 7.2.5
    - nginx
        - 1.20.1(latest1.27.4)
        - ssl配置
    - node
        - 16.20.2(lastest22.14.0lts)
        - node 16后不需要make安装直接配置路径即可

## 运行
- build_data.bat 打包更新表配置数据
- build_dev.bat 编译构建运行版本
- build_release.bat 构建发布版本

## 调试
- build后debug启动dev-debug即可调试断点ts