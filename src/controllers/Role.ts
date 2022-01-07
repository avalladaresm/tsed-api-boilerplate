import {BodyParams, Controller, Delete, Get, PathParams, Post, Put} from "@tsed/common";
import {Groups, Returns, Status, Summary} from "@tsed/schema";
import {Role} from "../entities/Role";
import {CustomError} from "../models/CustomError";
import {RoleService} from "../services/Role";
import {DeleteResult, InsertResult} from "typeorm";

@Controller("/")
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get("/roles")
  @Summary("Gets all roles")
  @(Returns(200, Role).Groups("read").Description("Returns an array of roles"))
  async getAllRoles(): Promise<Role[]> {
    try {
      const roles = await this.roleService.getAllRoles();
      return roles;
    } catch (e) {
      throw e;
    }
  }

  @Post("/role")
  @Summary("Creates a role")
  @(Returns(201, Role).Groups("read").Description("Returns the instance of the created role"))
  @(Status(400, CustomError).Description("Validation error or data is malformed"))
  async createRole(@BodyParams() @Groups("create") data: Role): Promise<InsertResult> {
    try {
      const role = await this.roleService.createRole(data);
      return role;
    } catch (e) {
      throw e;
    }
  }

  @Get("/role/:name")
  @Summary("Gets a role by name")
  @(Returns(200, Role).Groups("read").Description("Returns an account by name"))
  async getRoleByName(@PathParams("name") name: string): Promise<Role | undefined> {
    try {
      const role = await this.roleService.getRoleByName(name);
      return role;
    } catch (e) {
      throw e;
    }
  }

  @Put("/role/:id")
  @Summary("Updates a role by id")
  @(Returns(200, Role).Groups("read").Description("Returns the updated instance of the role"))
  async updateRole(@PathParams("id") id: string, @BodyParams() @Groups("update") data: Role): Promise<Partial<Role>> {
    try {
      const role = await this.roleService.updateRole(id, data);
      return role;
    } catch (e) {
      throw e;
    }
  }

  @Delete("/role/:id")
  @Summary("Deletes a role by id")
  @(Returns(200, Role).Description("An account has been deleted successfully"))
  async deleteRole(@PathParams("id") id: string): Promise<DeleteResult> {
    try {
      const role = await this.roleService.deleteRole(id);
      return role;
    } catch (e) {
      throw e;
    }
  }
}
