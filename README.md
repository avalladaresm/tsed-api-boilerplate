# generic-api

> An awesome project based on Ts.ED framework

See [Ts.ED](https://tsed.io) project for more information.

## Build setup

> **Important!** Ts.ED requires Node >= 10, Express >= 4 and TypeScript >= 3.

```batch
# install dependencies
$ npm install

# serve
$ npm run start

# build for production
$ npm run build
$ npm run start:prod
```

Database 
Account
Email: Bridget0@hotmail.com 

data.email = "Jonas23@yahoo.com"

const authFields = await this.userRepository.find({ where: { email: data.email } });
returns authFields = []

const authFields = await this.userRepository.findOne({ where: { email: data.email } });
returns authFields = undefined

const authFields = await this.userRepository.findOneOrFail({ where: { email: data.email } });
throws error object

 error: {
    name: 'EntityNotFoundError',
    message: 'Could not find any entity of type "Account" matching: {\n' +
      '    "where": {\n' +
      '        "email": "Jonas23@yahoo.com"\n' +
      '    }\n' +
      '}',
    status: 500,
    errors: [],
    stack: 'EntityNotFoundError: Could not find any entity of type "Account" matching: {\n' +
      '    "where": {\n' +
      '        "email": "Jonas23@yahoo.com"\n' +
      '    }\n' +
      '}\n' +
      '    at EntityNotFoundError.TypeORMError [as constructor] (C:\\Users\\javal\\Projects\\tsed-api-boilerplate\\src\\error\\TypeORMError.ts:7:9)\n' +
      '    at new EntityNotFoundError (C:\\Users\\javal\\Projects\\tsed-api-boilerplate\\src\\error\\EntityNotFoundError.ts:10:9)\n' +
      '    at C:\\Users\\javal\\Projects\\tsed-api-boilerplate\\src\\entity-manager\\EntityManager.ts:889:39\n' +
      '    at processTicksAndRejections (internal/process/task_queues.js:95:5)\n' +
      '    at AuthService.signin (C:\\Users\\javal\\Projects\\tsed-api-boilerplate\\src\\services\\Auth.ts:34:26)\n' +
      '    at AuthController.login (C:\\Users\\javal\\Projects\\tsed-api-boilerplate\\src\\controllers\\Auth.ts:20:19)'
  }

data.email = "Bridget0@hotmail.com"

const authFields = await this.userRepository.find({ where: { email: data.email } });
returns authFields = [Account entity]

const authFields = await this.userRepository.findOne({ where: { email: data.email } });
returns authFields = Account entity

const authFields = await this.userRepository.findOneOrFail({ where: { email: data.email } });
returns authFields = Account entity