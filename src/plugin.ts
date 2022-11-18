import {
    HindenburgPlugin,
    RoomPlugin,
    EventListener,
    Room,
    RoomAssignRolesEvent,
    Perspective,
    SetRoleMessage,
    BaseRole,
    RegisterRole
} from "@skeldjs/hindenburg";
import { Team1Role, Team2Role } from "./roles";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TeamGamemodePluginConfig {

}

@RegisterRole(Team1Role as typeof BaseRole)
@RegisterRole(Team2Role as typeof BaseRole)
@HindenburgPlugin("hbplugin-team-gamemode")
export class TeamGamemodePlugin extends RoomPlugin {
    team1Perspective?: Perspective;
    team2Perspective?: Perspective;

    constructor(public readonly room: Room, public config: TeamGamemodePluginConfig) {
        super(room, config);
    }

    isReady(): this is { team1Perspective: Perspective; team2Perspective: Perspective; } {
        return this.team1Perspective !== undefined && this.team2Perspective !== undefined;
    }

    @EventListener()
    onRoomAssignRoles(ev: RoomAssignRolesEvent<Room>) {
        ev.cancel();

        const playerPool = [...ev.roleAssignments.keys()];
        const numTeam1 = Math.ceil(playerPool.length / 2);

        const team1 = [];
        const team2 = [];

        for (let i = 0; i < numTeam1; i++) {
            const nextPlayerIdx = Math.floor(Math.random() * playerPool.length);
            const nextPlayer = playerPool[nextPlayerIdx];

            if (!nextPlayer)
                continue;

            playerPool.splice(nextPlayerIdx, 1);
            team1.push(nextPlayer);
        }

        team2.push(...playerPool);

        this.team1Perspective = ev.room.createPerspective(team1);
        this.team2Perspective = ev.room.createPerspective(team2);

        this.team1Perspective.outgoingFilter = this.team2Perspective.outgoingFilter;
        this.team1Perspective.incomingFilter = this.team2Perspective.incomingFilter;

        this.team1Perspective.outgoingFilter.on(SetRoleMessage, message => {
            message.cancel();
        });

        for (const player of team1) {
            const playerPov = this.team1Perspective.resolvePlayer(player);
            if (!playerPov)
                continue;

            playerPov.control?.setRole(Team1Role as typeof BaseRole);

            player.control?.setName("[<color=blue>Team 1</color>] " + player.playerInfo?.defaultOutfit.name);
        }

        for (const player of team2) {
            const playerPov = this.team2Perspective.resolvePlayer(player);
            if (!playerPov)
                continue;

            playerPov.control?.setRole(Team2Role as typeof BaseRole);

            player.control?.setName("[<color=red>Team 2</color>] " + player.playerInfo?.defaultOutfit.name);
        }
    }
}

