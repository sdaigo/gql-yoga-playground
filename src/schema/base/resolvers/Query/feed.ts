import { GraphQLError } from "graphql";
import type { QueryResolvers } from "./../../../types.generated";

const applyTakeConstraints = (params: {
  min: number;
  max: number;
  value: number;
}) => {
  if (params.value < params.min || params.value > params.max) {
    throw new GraphQLError(
      `'take' argument value '${params.value}' is outside the valid range of '${params.min}' to '${params.max}'.`,
    );
  }
  return params.value;
};

const applySkipConstraints = (params: { min: number; value: number }) => {
  if (params.value < params.min) {
    throw new GraphQLError(
      `'skip' argument value '${params.value}' is outside the valid range of '${params.min}'.`,
    );
  }
  return params.value;
};

export const feed: NonNullable<QueryResolvers["feed"]> = async (
  _parent,
  args,
  ctx,
) => {
  const where = args.filterNeedle
    ? {
        OR: [
          {
            description: { contains: args.filterNeedle },
          },
          {
            url: { contains: args.filterNeedle },
          },
        ],
      }
    : {};

  const take = applyTakeConstraints({
    min: 1,
    max: 100,
    value: args.take ?? 30,
  });

  const skip = applySkipConstraints({
    min: 0,
    value: args.skip ?? 0,
  });

  return ctx.prisma.link.findMany({
    where,
    skip,
    take,
  });
};
