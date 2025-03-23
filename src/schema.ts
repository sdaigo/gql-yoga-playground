import type { Comment, Link } from "@prisma/client";
import { GraphQLError } from "graphql";
import { createSchema } from "graphql-yoga";
import type { GraphQLContext } from "./context";

/**
 * GraphQL Schema definition
 */
const typeDefinitions = `
  type Link {
    id: ID!
    description: String!
    url: String!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    createdAt: String!
    link: Link!
  }

  type Query {
    info: String!
    feed(filterNeedle: String, skip: Int, take: Int): [Link!]!
    link(id: ID!): Link
    comment(id: ID!): Comment
  }

  type Mutation {
    postLink(url: String!, description: String!): Link!
    postCommentOnLink(linkId: ID!, text: String!): Comment!
  }
`;

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

/**
 * GraphQL Resolvers: the actual implementation of the schema
 */
const resolvers = {
  Query: {
    info: () => "This is the API of a Hackernews Clone",
    feed: async (
      parent: never,
      args: { filterNeedle: string; skip?: number; take?: number },
      context: GraphQLContext,
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

      return await context.prisma.link.findMany({
        where,
        skip,
        take,
      });
    },
    link: async (
      parent: never,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      return await context.prisma.link.findUnique({
        where: {
          id: args.id,
        },
      });
    },
    comment: async (
      parent: never,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      return context.prisma.comment.findUnique({
        where: {
          id: args.id,
        },
      });
    },
  },
  Mutation: {
    postLink: async (
      _: never,
      args: Omit<Link, "id">,
      context: GraphQLContext,
    ) => {
      const link = await context.prisma.link.create({
        data: {
          description: args.description,
          url: args.url,
        },
      });

      return link;
    },
    postCommentOnLink: async (
      _: never,
      args: Omit<Comment, "id" | "createdAt">,
      context: GraphQLContext,
    ) => {
      const comment = await context.prisma.comment
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
    },
  },
  Comment: {
    link: async (parent: Comment, _: never, context: GraphQLContext) => {
      return await context.prisma.link.findUnique({
        where: {
          id: parent.linkId,
        },
      });
    },
  },
  Link: {
    id: (parent: Link) => parent.id,
    description: (parent: Link) => parent.description,
    url: (parent: Link) => parent.url,
    comments: async (parent: Link, _: never, context: GraphQLContext) => {
      return context.prisma.comment.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          linkId: parent.id,
        },
      });
    },
  },
};

export const schema = createSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions],
});
