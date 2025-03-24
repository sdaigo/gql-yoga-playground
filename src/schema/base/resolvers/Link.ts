import type { LinkResolvers } from "./../../types.generated";
export const Link: LinkResolvers = {
  /* Implement Link resolver logic here */
  comments: async (parent, _arg, ctx) => {
    return ctx.prisma.comment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        linkId: parent.id,
      },
    });
  },
};
