import {Service} from "@tsed/common";
import {TypeORMService} from "@tsed/typeorm";
import {Role} from "../entities/Role";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager, InsertResult} from "typeorm";

@Service()
export class RoleService {
  private connection: ConnectionManager;
  constructor(private typeORMService: TypeORMService) {}
  private entityManager = getManager();

  $afterRoutesInit(): void {
    this.connection = getConnectionManager();
  }

  async getAllRoles(): Promise<Role[]> {
    try {
      const roles = await this.entityManager.find(Role);
      return roles;
    } catch (e) {
      throw e;
    }
  }

  async createRole(data: Role): Promise<InsertResult> {
    try {
      const role = await this.entityManager.insert(Role, data);
      return role;
    } catch (e) {
      throw e;
    }
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    try {
      const role = await this.entityManager.findOne(Role, name);
      return role;
    } catch (e) {
      throw e;
    }
  }

  async updateRole(id: string, data: Role): Promise<Partial<Role>> {
    try {
      const role = await this.entityManager
        .createQueryBuilder()
        .update(Role, {
          name: data.name
        })
        .whereEntity({id: id} as Role)
        .returning(["id"])
        .execute();
      return role.generatedMaps[0];
    } catch (e) {
      throw e;
    }
  }

  async deleteRole(id: string): Promise<DeleteResult> {
    try {
      const role = await this.entityManager
        .createQueryBuilder()
        .delete()
        .from(Role)
        .where({id: id} as Role)
        .execute();

      return role;
    } catch (e) {
      throw e;
    }
  }
}
