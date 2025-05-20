import { Strategy as PassportStrategy } from 'passport-strategy';

export interface DiscordProfile {
    id: string;
    username: string;
    avatar?: string;
    discriminator?: string;
    email?: string;
    verified?: boolean;
    provider: 'discord';
    accessToken: string;
    refreshToken?: string;
    avatarUrl?: string;
    connections?: any[];
    guilds?: any[];
    fetchedAt?: Date;
    [key: string]: any;
}

export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    authorizationURL?: string;
    tokenURL?: string;
    scopeSeparator?: string;
    passReqToCallback?: boolean;
    permissions?: any;
    prompt?: any;
}

export type VerifyCallback = (
    accessToken: string,
    refreshToken: string,
    profile: DiscordProfile,
    done: (error: any, user?: any) => void
) => void;

export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
    static addUserToGuild(
        guildId: string,
        userId: string,
        accessToken: string,
        botToken: string,
        options: Record<string, any> | ((err?: Error) => void),
        callback?: (err?: Error) => void
    ): void;
}

export function addUserToGuild(
    guildId: string,
    userId: string,
    accessToken: string,
    botToken: string,
    options: Record<string, any> | ((err?: Error) => void),
    callback?: (err?: Error) => void
): void;