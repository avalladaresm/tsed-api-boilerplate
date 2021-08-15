### Generate migrations

`yarn typeorm:runmig migration:generate -n Action_TableName`

### Execute migrations

`yarn typeorm:runmig migration:run`

### Config seeder

```
yarn seed:config
or
yarn seed:config -n ormconfig.ts
```

### Run seeder

```
yarn seed:run
or run a specific seed
yarn seed:run -s SeedName
```
