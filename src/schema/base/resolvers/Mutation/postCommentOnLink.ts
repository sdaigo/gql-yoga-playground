import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";

export const postCommentOnLink: NonNullable<
  MutationResolvers["postCommentOnLink"]
> = async (_parent, args, ctx) => {
  const comment = await ctx.prisma.comment
    .create({
      data: {
        text: args.text,
        linkId: args.linkId,
      },
    })
    .catch((err: unknown) => {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return Promise.reject(
          new GraphQLError(
            `Cannot post comment on non-existing link with id '${args.linkId}'.`,
          ),
        );
      }
      return Promise.reject(err);
    });

  return comment;
};
