export class User {

	public uid: number;
	public nickname: string;
	public openId: string;
	public createTime: number;
	public updateTime: number;

	constructor(
		uid?: number,
		nickname: string = '',
		openId: string = '',
		createTime: number = 0,
		updateTime: number = 0,
	) {
		this.uid = uid;
		this.nickname = nickname;
		// 角色唯一标示
		this.openId = openId;
		// 角色最开始进入游戏时间
		this.createTime = createTime;
		// 每次进入游戏更新时间
		this.updateTime = updateTime;
	}

}
