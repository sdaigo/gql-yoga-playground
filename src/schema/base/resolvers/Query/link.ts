import type { QueryResolvers } from "./../../../types.generated";
export const link: NonNullable<QueryResolvers["link"]> = async (
  _parent,
  args,
  ctx,
) => {
  return ctx.prisma.link.findUnique({
    where: {
      id: args.id,
    },
  });
};
