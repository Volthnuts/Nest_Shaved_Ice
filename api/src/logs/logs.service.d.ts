import { Log } from './entities/log.entity';
import { Repository } from 'typeorm';
export declare class LogsService {
    private logRepository;
    constructor(logRepository: Repository<Log>);
    logSingPdf(userId: string, action: string, fileName: string, success: boolean, errorMessage?: string): Promise<void>;
}
