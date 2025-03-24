import type { CommentResolvers } from "./../../types.generated";
export const Comment: CommentResolvers = {
  /* Implement Comment resolver logic here */
  createdAt: ({ createdAt }, _arg, _ctx) => {
    return createdAt.toISOString();
  },
  link: async (parent, _args, ctx) => {
    return ctx.prisma.link.findUniqueOrThrow({
      where: {
        id: parent.linkId,
      },
    });
  },
};
