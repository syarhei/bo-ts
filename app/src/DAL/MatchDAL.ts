import {inject, injectable} from "inversify";
import {DATABASE_CONTEXT} from "../../inversify/identifiers/common";
import {DBContext} from "../DB/DBContext";
import {Match} from "../contracts/Match";
import * as sequelize from "sequelize";

@injectable()
export class MatchDAL {
    private match: sequelize.Model<sequelize.Instance<Match>, Match> = null;
    constructor(@inject(DATABASE_CONTEXT) private dbContext: DBContext) {
        this.match = dbContext.MATCH;
    }

    public async createMatch(matchOptions: Match) {
        const match = await this.match.create(matchOptions);
        return match.get();
    }

    public async searchLastMatches(teamId: string, limit: number = 10): Promise<Match[]> {
        const matches = await this.match.findAll({
            where: {
                [sequelize.Op.or]: [
                    { teamHomeId: teamId },
                    { teamGuestId: teamId }
                ]
            },
            order: ["date"],
            limit: limit,
            offset: 0
        });
        return matches.map(match => match.get());
    }

    public async updateMatchProps(id: string, matchOptions: Match): Promise<boolean> {
        const [number] = await this.match.update(matchOptions, {where: { id }});
        return number > 0;
    }

    public async deleteMatchById(id: string): Promise<boolean> {
        const number = await this.match.destroy({where: { id }});
        return number > 0;
    }
}