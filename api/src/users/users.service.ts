import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ){}

  async findUserByEmail(email: string): Promise<User | null>{
    return this.userRepository.findOneBy({ email });
  }
  
  async register(registerUserDto: RegisterUserDto) {
    const userExists = await this.findUserByEmail(registerUserDto.email)
    if(userExists) throw new BadRequestException('Email is not available')

    registerUserDto.password = await hash(registerUserDto.password,10)
    let user = this.userRepository.create(registerUserDto);
    user = await this.userRepository.save(user)
    const { password, ...result } = user;
    
    return result;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
