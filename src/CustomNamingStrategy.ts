import {DefaultNamingStrategy, Table, NamingStrategyInterface} from "typeorm";

export class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const columnsSnakeCase = columnNames.join("_");

    return `PK_${table}_${columnsSnakeCase}`;
  }

  foreignKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const columnsSnakeCase = columnNames.join("_");

    return `FK_${table}_${columnsSnakeCase}`;
  }

  defaultConstraintName(tableOrName: Table | string, columnName: string): string {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;

    return `DFV_${table}_${columnName}`;
  }

  uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const columnsSnakeCase = columnNames.join("_");

    return `UQ_${table}_${columnsSnakeCase}`;
  }

  indexName(tableOrName: Table | string, columnNames: string[]): string {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const columnsSnakeCase = columnNames.join("_");

    return `IDX_${table}_${columnsSnakeCase}`;
  }
}
