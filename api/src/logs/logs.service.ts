import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Log } from 'src/logs/entities/log.entity';
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity"; // ต้องมี import นี้เพื่อเชื่อม user

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async logSignPdf(userId: string, action: string, filename: string, success: boolean, error?: any) {
    const description = success
      ? `Signed PDF ${filename} successfully.`
      : `Failed to sign PDF ${filename}: ${error?.message || 'Unknown error'}`;

    const log = this.logRepository.create({
      user: { id: userId } as User,  // ใช้แบบนี้เพื่อ set user เฉพาะ id โดยไม่ต้องดึงทั้ง object
      action,
      description,
    });

    await this.logRepository.save(log);
  }
}
