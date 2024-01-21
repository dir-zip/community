import { Prisma, PrismaClient } from "@prisma/client";

type UserWithInventory = Prisma.UserGetPayload<{
  include: { inventory: { include: { collection: true } } };
}>;

type PostWithUserAndInventory = Prisma.PostGetPayload<{
  include: {
    user: {
      include: {
        inventory: {
          include: {
            collection: true
          }
        }
      }
    }
  }
}>


const prismaClient = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
}).$extends({
  query: { 
    user: {
      async findFirst({ model, operation, args, query }) {

        args.include = { ...args.include, inventory: { 
          include: {
            collection: {
              where: {
                equipped: true,
              },
              include: {
                item: true
              }
            }
          }
         } }

        return query(args)
      },
      async findMany({ model, operation, args, query }) {

        args.include = { ...args.include, inventory: { 
          include: {
            collection: {
              where: {
                equipped: true,
              },
              include: {
                item: true
              }
            }
          }
         } }

        return query(args)
      },
      async findUnique({ model, operation, args, query }) {

        args.include = { ...args.include, inventory: { 
          include: {
            collection: {
              where: {
                equipped: true,
              },
              include: {
                item: true
              }
            }
          }
         } }

        return query(args)
      },
    },
    post: {
      async findFirst({ model, operation, args, query }) {
        args.include = { ...args.include, user: {
          include: {
            inventory: {
              include: {
                collection: {
                  where: {
                    equipped: true
                  },
                  include: {
                    item: true
                  }
                }
              }
            }
          }
        }}
        return query(args)
      },
      async findMany({ model, operation, args, query })  {
        args.include = { ...args.include, 
          user: {
          include: {
            inventory: {
              include: {
                collection: {
                  where: {
                    equipped: true
                  },
                  include: {
                    item: true
                  }
                }
              }
            }
          }
        }}
        return query(args);
      }
    },
    comment: {
      async findMany({ model, operation, args, query }) {
        args.include = { ...args.include, 
          replies: {
            include: {
              user: {
                include: {
                  inventory: {
                    include: {
                      collection: {
                        where: {
                          equipped: true
                        },
                        include: {
                          item: true
                        }
                      }
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          parent: {
            include: {
              user: {
                include: {
                  inventory: {
                    include: {
                      collection: {
                        where: {
                          equipped: true
                        },
                        include: {
                          item: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          user: {
            include: {
              inventory: {
                include: {
                  collection: {
                    where: {
                      equipped: true
                    },
                    include: {
                      item: true
                    }
                  }
                }
              }
            }
          },
          post: {
            include: {
              user: {
                include: {
                  inventory: {
                    include: {
                      collection: {
                        where: {
                          equipped: true
                        },
                        include: {
                          item: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return query(args)
      },
      async findFirst({ model, operation, args, query }) {
        args.include = { ...args.include, 
          replies: {
            include: {
              user: {
                include: {
                  inventory: {
                    include: {
                      collection: {
                        where: {
                          equipped: true
                        },
                        include: {
                          item: true
                        }
                      }
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          parent: {
            include: {
              user: {
                include: {
                  inventory: {
                    include: {
                      collection: {
                        where: {
                          equipped: true
                        },
                        include: {
                          item: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          user: {
            include: {
              inventory: {
                include: {
                  collection: {
                    where: {
                      equipped: true
                    },
                    include: {
                      item: true
                    }
                  }
                }
              }
            }
          },
          post: {
            include: {
              user: {
                include: {
                  inventory: {
                    include: {
                      collection: {
                        where: {
                          equipped: true
                        },
                        include: {
                          item: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        
        return query(args)
      }
    }
  }
})

type ExtendedPrismaClient = typeof prismaClient

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: ExtendedPrismaClient | undefined;
}

export const prisma = prismaClient



export * from "@prisma/client";

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}


