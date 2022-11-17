import { Logger, WARNINGLEVEL } from 'discord.ts-architecture';
import mysql from 'mysql';

export default class SqlHandler {
  private pool: mysql.Pool;
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      database: process.env.DB_DATABASE,
      multipleStatements: true,
      connectionLimit: 5
    });
  }

  /**
   * Initializes the DataBase
   */
  public async initDB() {
    let conn;
    try {
      conn = await this.noArgsToPromise(this.pool.getConnection);
      await this.asyncQuery(
        conn,
        'CREATE TABLE IF NOT EXISTS `channels` (`id` VARCHAR(255) NOT NULL, `replacement` VARCHAR(255) NOT NULL, PRIMARY KEY (`id`))'
      );
    } catch (err) {
      Logger.exception('Error creating tables', err, WARNINGLEVEL.ERROR);
      throw err;
    } finally {
      if (conn) conn.release();
    }
    Logger.info('Initialized Database');
  }

  /**
   * Saves the channel configuration
   * @param channelId selected channel
   * @param replacement replacement string
   * @returns if it was successful
   */
  public async saveChannel(channelId: string, replacement: string) {
    return await this.sqlHandle(
      async (conn) => {
        const sqlResult = await this.asyncQuery(conn, 'SELECT `id` FROM `channels` WHERE `id` = ?', channelId);
        if (sqlResult && sqlResult[0]) {
          await this.asyncQuery(conn, 'UPDATE `channels` SET `replacement` = ? WHERE `id` = ?', replacement, channelId);
        } else {
          await this.asyncQuery(conn, 'INSERT INTO `channels` (id, replacement) VALUES (?,?)', channelId, replacement);
        }
        return true;
      },
      (error) => {
        Logger.exception('Errror while saving channel', error, WARNINGLEVEL.ERROR);
      },
      false
    );
  }

  /**
   * Removes a Channel Configuration
   * @param channelId selected c hannel
   * @returns if it was successfull
   */
  public async removeChannel(channelId: string) {
    return await this.sqlHandle(
      async (conn) => {
        await this.asyncQuery(conn, 'DELETE FROM `channels` WHERE `id` = ?', channelId);
        return true;
      },
      (error) => {
        Logger.exception('Error while removing channel', error, WARNINGLEVEL.ERROR);
      },
      false
    );
  }

  /**
   * Finds a Channel in the database by id
   * @param {String} channelId channel id
   */
  public async findChannel(channelId: string) {
    return await this.sqlHandle<string | undefined>(
      async (conn) => {
        const sqlResult = await this.asyncQuery(conn, 'SELECT `replacement` FROM `channels` WHERE `id` = ?', channelId);
        if (sqlResult && sqlResult[0]) {
          return sqlResult[0].replacement;
        }
      },
      (error) => {
        Logger.exception('Error while finding channel', error, WARNINGLEVEL.ERROR);
      },
      undefined
    );
  }

  private async noArgsToPromise<T>(
    func: (callback: (err: mysql.MysqlError, returnValue: T) => void) => void
  ): Promise<T> {
    return await new Promise((resolve, reject) => {
      func((err, val) => {
        if (err) reject(err);
        else resolve(val);
      });
    });
  }

  private async asyncQuery(conn: mysql.PoolConnection, query: string, ...values: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      conn.query(query, values, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  private async sqlHandle<T>(
    normal: (conn: mysql.PoolConnection) => Promise<T>,
    error: (err: unknown) => void,
    initial: T
  ) {
    let returnValue: T = initial;
    let conn;
    try {
      conn = await this.noArgsToPromise(this.pool.getConnection);
      returnValue = await normal(conn);
    } catch (e) {
      error(e);
    } finally {
      if (conn) conn.release();
    }
    return returnValue;
  }
}
