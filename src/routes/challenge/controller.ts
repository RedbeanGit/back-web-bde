import { Challenge } from "@prisma/client";
import { FastifyInstance } from "fastify";
import {
  ChallengeInfo,
  ChallengeInfoMinimal,
} from "../../models/ChallengeInfo";

//Create challenge with provided info
export async function createChallenge(
  fastify: FastifyInstance,
  challengeInfo: ChallengeInfo,
  creatorId: number
) {
  //Chack challenge info
  if (!challengeInfo) {
    throw fastify.httpErrors.badRequest("No challenge info provided");
  }

  //Check if reward is positive (if provided)
  if (challengeInfo.reward && challengeInfo.reward < 0) {
    throw fastify.httpErrors.badRequest("Reward must pe positive");
  }

  //Chack creatorId
  if (!creatorId) {
    throw fastify.httpErrors.badRequest("Invalid creator id");
  }

  await fastify.prisma.challenge.createChallenge(challengeInfo, creatorId);
}

//Update challenge with provided info by id
export async function updateChallenge(
  fastify: FastifyInstance,
  challengeId: number,
  challengeInfo: ChallengeInfo
) {
  //Check challenge info
  if (!challengeInfo) {
    throw fastify.httpErrors.badRequest("No challenge info provided");
  }

  //Check if reward is positive (if rewarded)
  if (challengeInfo.reward && challengeInfo.reward < 0) {
    throw fastify.httpErrors.badRequest("Reward must pe positive");
  }

  //Check challengeId
  if (!challengeId) {
    throw fastify.httpErrors.badRequest("Invalid challenge id");
  }

  await fastify.prisma.challenge.updateChallenge(challengeInfo, challengeId);
}

//Delete challenge by id
export async function deleteChallenge(
  fastify: FastifyInstance,
  challengeId: number
) {
  //Check challengeId
  if (!challengeId) {
    throw fastify.httpErrors.badRequest("Invalid challenge id");
  }

  await fastify.prisma.challenge.deleteChallenge(challengeId);
}

//Get challenge by id
export async function getChallenge(
  fastify: FastifyInstance,
  challengeId: number
) {
  //Check challengeId
  if (!challengeId) {
    throw fastify.httpErrors.badRequest("Invalid challenge id");
  }

  const challenge = await fastify.prisma.challenge.getChallenge(challengeId);

  //Check if challenge not found
  if (!challenge) {
    throw fastify.httpErrors.notFound("Challenge not found");
  }

  return convertTime(challenge);
}

//Get all challenge in DB
export async function getManyChallenge(fastify: FastifyInstance) {
  const challenges = await fastify.prisma.challenge.getManyChallenge();

  //Check if challenge DB empty
  if (!challenges || !challenges.length) {
    throw fastify.httpErrors.notFound("No Challenge in DB");
  }

  //We only return name and reward, other values are not needed
  return challenges.map<ChallengeInfoMinimal>((val) => {
    return {
      name: val.name,
      reward: val.reward,
      id: val.id
    };
  });
}

//Convert UTC time depending on user's timezone
function convertTime(challenge: Challenge) {
  challenge.createdAt.setMinutes(
    challenge.createdAt.getMinutes() - challenge.createdAt.getTimezoneOffset()
  );
  return challenge;
}
