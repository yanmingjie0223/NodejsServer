export default class Singleton {

	private static _instance: Singleton;
	public static getInstance<T extends Singleton>(): T {
		if (!this._instance) {
			this._instance = new this();
			this._instance.initialize();
		}
		return this._instance as T;
	}

	public static deleteInstance(): void {
		if (this._instance) {
			this._instance.destroy();
			this._instance = null!;
		}
	}

	public initialize(): void { }

	public destroy(): void { }

}
