import { BaseRole, RoleMetadata, RoleTeamType, RoleType } from "@skeldjs/core";

export class Team1Role extends BaseRole {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.Impostor,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: true
    };
}
