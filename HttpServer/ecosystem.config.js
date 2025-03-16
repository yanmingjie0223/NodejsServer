module.exports = {
	apps: [
		{
			name: "server", //服务名称
			script: "./dist/index.js", // 入口
			instances: 1, // 实例数量 (cluster模式,多个的话就是并发模式,平摊到所有进程)
			autorestart: true, // 是否自重启
			watch: false, // 监听代码改变, 改变后自动重启
			out_file: "./logs/server.log", //日志类容
			max_memory_restart: "2G", // 超过最大内存则自动重启
			node_args: [
				"--max_semi_space_size=64" // 调整V8垃圾回收的新生代内存大小为64mb.以便降低垃圾回收触发几率
			]
		}
	]
}
