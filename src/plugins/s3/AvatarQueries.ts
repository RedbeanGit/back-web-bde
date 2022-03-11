import { FastifyInstance } from "fastify";
import * as Minio from "minio";
import internal = require("stream");

export function AvatarQueries(fastify: FastifyInstance, client: Minio.Client) {
  return {
    putAvatar: async function (avatar: internal.Readable, userId: number) {
      try {
        return await client.putObject("avatars", `${userId}`, avatar);
      } catch (err) {
        fastify.log.error(err);

        throw fastify.httpErrors.internalServerError("Avatar upload failed");
      }
    },
    getAvatar: async function (userId: number) {
      try {
        return await client.getObject("avatars", `${userId}`);
      } catch (err) {
        if (
          err instanceof Error &&
          err.message.includes("The specified key does not exist")
        ) {
          throw fastify.httpErrors.notFound("Avatar not found");
        }

        fastify.log.error(err);

        throw fastify.httpErrors.internalServerError("Avatar download failed");
      }
    },
    getManyAvatar: async function (offset: number, limit: number) {
      let allQueriesSucceded = true;
      let avatars: internal.Readable[] = [];
      for (let index = offset; index <= limit + offset; index++) {
        try {
          avatars.push(await client.getObject("avatars", `${index}`));
        } catch (err) {
          if (
            !(
              err instanceof Error &&
              err.message.includes("The specified key does not exist")
            )
          ) {
            fastify.log.error(err);

            throw fastify.httpErrors.internalServerError(
              "Avatar download failed"
            );
          }
          allQueriesSucceded = false;
        }
      }
      return avatars;
    },
    deleteAvatar: async function (userId: number) {
      try {
        return await client.removeObject("avatars", `${userId}`);
      } catch (err) {
        fastify.log.error(err);

        throw fastify.httpErrors.internalServerError("Avatar delete failed");
      }
    },
  };
}
