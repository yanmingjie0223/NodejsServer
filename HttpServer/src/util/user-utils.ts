import { Repository } from "typeorm";
import { UserEntity } from "../model/user-entity";

/**
 * 根据openId获取用户数据
 * @param userRepository
 * @param tableName
 * @param openId
 * @returns
 */
export async function getUserByOpenId<T extends UserEntity>(userRepository: Repository<UserEntity>, tableName: string, openId: string): Promise<T> {
	const entity = await userRepository.createQueryBuilder(`${tableName}`)
		.where(`${tableName}.openId = :openId`, { openId: openId })
		.getOne();
	if (entity) {
		entity.initialize();
	}
	return entity as T;
}
