import { AuthorizationError } from "./errors";
import { type Data } from "./types";

export const CrudTypesArray = [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "SUPER",
] as const;
export type CrudTypes = (typeof CrudTypesArray)[number];

export type TRule = [ability: CrudTypes, resource: string];

export type TCreateGuard<T> = ({
  sessionData,
  can,
  cannot,
}: {
  sessionData?: Data<T>;
  can: (
    ability: CrudTypes,
    resource: string,
    customFunction?: (args: any) => Promise<boolean>,
  ) => void;
  cannot: (
    ability: CrudTypes,
    resource: string,
    customFunction?: (args: any) => Promise<boolean>,
  ) => void;
}) => Promise<void>;

export type TGuardBuilder<T> = {
  createGuards: (guards: TCreateGuard<T>) => Promise<void>;
  validateGuard: (rule: TRule, args?: any) => Promise<boolean>;
  authorize: (rule: TRule, args?: any) => Promise<void>;
  canAccess: boolean;
};

export class GuardBuilder<T> {
  sessionData?: Data<T>;
  public canAccess: boolean;
  private rules: {
    can: boolean;
    ability: CrudTypes;
    resource: string;
    customFunction?: (args: any) => Promise<boolean>;
  }[] = [];

  constructor(sessionData?: Data<T>) {
    this.sessionData = sessionData;
    this.rules = [];
    this.canAccess = false;
  }

  async createGuards(guards: TCreateGuard<T>) {
    try {
      await guards({
        sessionData: this.sessionData ? this.sessionData : undefined,
        can: (
          ability: CrudTypes,
          resource: string,
          customFunction?: (args: any) => Promise<boolean>,
        ) => {
          this.rules = [
            { can: true, ability, resource, customFunction },
            ...this.rules,
          ];
        },
        cannot: (
          ability: CrudTypes,
          resource: string,
          customFunction?: (args: any) => Promise<boolean>,
        ) => {
          this.rules = [
            { can: false, ability, resource, customFunction },
            ...this.rules,
          ];
        },
      });
    } catch (e) {
      throw new Error(`Don't throw errors in guard`);
    }
  }

  async validateGuard(rule: TRule, args?: any) {
    for (const r of this.rules) {
      if (r.ability === "SUPER" && r.resource === "all") {
        this.canAccess = r.can;
        break;
      }

      if (r.ability === rule[0] && r.resource === rule[1]) {
        if (r.customFunction) {
          if (await r.customFunction(args)) {
            this.canAccess = r.can;
          } else {
            continue;
          }
        } else {
          this.canAccess = r.can;
        }

        break;
      }
    }

    return this.canAccess;
  }

  async authorize(rule: TRule, args?: any) {
    const canAccess = await this.validateGuard(rule, args);
    if (!canAccess) {
      throw new AuthorizationError();
    }
    this.canAccess = false;
  }
}
