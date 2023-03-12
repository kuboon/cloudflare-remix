import { SqlitePlugin } from './SqlitePlugin';
import { ColumnType, Generated, InsertObject, UpdateObject, Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';

type UserId = string;
interface UserTable {
  id: Generated<UserId>;
  userName: string;
  registered: number; // 1 for true
}

interface CredTable {
  credId: string,
  userId: UserId,
  publicKey: string,
  type: string,
  transports: string,
  counter: number,
  created_at: string,
}


interface Database {
  users: UserTable;
  creds: CredTable;
}

export class database {
  db: Kysely<Database>;
  constructor(database: D1Database) {
    this.db = new Kysely<Database>({
      dialect: new D1Dialect({ database }),
      plugins: [new SqlitePlugin()],
    })
  }
  getUser(userName: string) {
    return this.db.selectFrom('users').selectAll().where('userName', '=', userName).executeTakeFirst();
  }
  createUser(user: InsertObject<Database, 'users'>) {
    return this.db.insertInto('users').values([user]).execute();
  }
  updateUser(id: UserId, user: UpdateObject<Database, 'users'>) {
    return this.db.updateTable('users').set(user).where('id', '=', id).executeTakeFirst();
  }
  getCredsForUser(userId: UserId) {
    return this.db.selectFrom('creds').selectAll().where('userId', '=', userId).execute();
  }
  createCred(cred: InsertObject<Database, 'creds'>) {
    return this.db.insertInto('creds').values([cred]).execute();
  }
}
