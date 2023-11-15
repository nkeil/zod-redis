import * as sinon from 'sinon';
import { describe, expect, it } from 'vitest';
import { ZRedis } from '../../../src/index';

describe('ZRedis', () => {
  describe('constructor', () => {
    it('should parse options correctly', () => {
      const stub = sinon
        .stub(ZRedis.prototype, 'connect')
        .returns(Promise.resolve());

      let option;
      try {
        option = getOption();
        expect(option).toHaveProperty('port', 6379);
        expect(option).toHaveProperty('host', 'localhost');
        expect(option).toHaveProperty('family', 4);

        option = getOption(6380);
        expect(option).toHaveProperty('port', 6380);
        expect(option).toHaveProperty('host', 'localhost');

        option = getOption('6380');
        expect(option).toHaveProperty('port', 6380);

        option = getOption(6381, '192.168.1.1');
        expect(option).toHaveProperty('port', 6381);
        expect(option).toHaveProperty('host', '192.168.1.1');

        option = getOption(6381, '192.168.1.1', {
          password: '123',
          db: 2,
        });
        expect(option).toHaveProperty('port', 6381);
        expect(option).toHaveProperty('host', '192.168.1.1');
        expect(option).toHaveProperty('password', '123');
        expect(option).toHaveProperty('db', 2);

        option = getOption('redis://:authpassword@127.0.0.1:6380/4');
        expect(option).toHaveProperty('port', 6380);
        expect(option).toHaveProperty('host', '127.0.0.1');
        expect(option).toHaveProperty('password', 'authpassword');
        expect(option).toHaveProperty('db', 4);

        option = getOption('redis://:1+1@127.0.0.1:6380');
        expect(option).toHaveProperty('password', '1+1');

        option = getOption(
          `redis://127.0.0.1:6380/?password=${encodeURIComponent('1+1')}`,
        );
        expect(option).toHaveProperty('password', '1+1');

        option = getOption('redis://127.0.0.1/');
        expect(option).toHaveProperty('db', 0);

        option = getOption('/tmp/redis.sock');
        expect(option).toHaveProperty('path', '/tmp/redis.sock');

        option = getOption({
          port: 6380,
          host: '192.168.1.1',
        });
        expect(option).toHaveProperty('port', 6380);
        expect(option).toHaveProperty('host', '192.168.1.1');

        option = getOption({
          path: '/tmp/redis.sock',
        });
        expect(option).toHaveProperty('path', '/tmp/redis.sock');

        option = getOption({
          port: '6380',
        });
        expect(option).toHaveProperty('port', 6380);

        option = getOption({
          showFriendlyErrorStack: true,
        });
        expect(option).toHaveProperty('showFriendlyErrorStack', true);

        option = getOption(6380, {
          host: '192.168.1.1',
        });
        expect(option).toHaveProperty('port', 6380);
        expect(option).toHaveProperty('host', '192.168.1.1');

        option = getOption('6380', {
          host: '192.168.1.1',
        });
        expect(option).toHaveProperty('port', 6380);

        option = getOption('rediss://host');
        expect(option).toHaveProperty('tls', true);

        option = getOption('rediss://example.test', {
          tls: { hostname: 'example.test' },
        });
        expect(option.tls).toStrictEqual({ hostname: 'example.test' });

        option = getOption('redis://localhost?family=6');
        expect(option).toHaveProperty('family', 6);
      } catch (err) {
        stub.restore();
        throw err;
      }
      stub.restore();

      function getOption(...args: any) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const redis = new ZRedis(...args);
        return redis.options;
      }
    });

    it('should throw when arguments is invalid', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        new Redis(() => {});
      }).toThrow(Error);
    });
  });

  describe('.createClient', () => {
    it('should redirect to constructor', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const redis = ZRedis.createClient({ name: 'pass', lazyConnect: true });
      expect(redis.options).toHaveProperty('name', 'pass');
      expect(redis.options).toHaveProperty('lazyConnect', true);
    });
  });

  describe('#end', () => {
    it('should redirect to #disconnect', async () => {
      await new Promise<void>((res) => {
        const redis = new ZRedis({ lazyConnect: true });
        const stub = sinon.stub(redis, 'disconnect').callsFake(() => {
          stub.restore();
          res();
        });
        redis.end();
      });
    });
  });

  describe('#flushQueue', () => {
    it('should flush all queues by default', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const flushQueue = (ZRedis.prototype as any).flushQueue;
      const redis = {
        offlineQueue: [{ command: { reject: () => {} } }],
        commandQueue: [{ command: { reject: () => {} } }],
      } as const;
      const offline = sinon.mock(redis.offlineQueue[0].command);
      const command = sinon.mock(redis.commandQueue[0].command);
      offline.expects('reject').once();
      command.expects('reject').once();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      flushQueue.call(redis);
      offline.verify();
      command.verify();
    });

    it('should be able to ignore a queue', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const flushQueue = (ZRedis.prototype as any).flushQueue;
      const redis = {
        offlineQueue: [{ command: { reject: () => {} } }],
        commandQueue: [{ command: { reject: () => {} } }],
      } as const;
      const offline = sinon.mock(redis.offlineQueue[0].command);
      const command = sinon.mock(redis.commandQueue[0].command);
      offline.expects('reject').once();
      command.expects('reject').never();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      flushQueue.call(redis, new Error(), { commandQueue: false });
      offline.verify();
      command.verify();
    });
  });
});
