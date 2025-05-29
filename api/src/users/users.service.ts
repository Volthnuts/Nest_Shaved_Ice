import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { CreateGoogleUserDto } from './dto/create-user-google.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ){}

  async findUserByEmail(email: string): Promise<User | null>{
    return this.userRepository.findOneBy({ email: email });
  }
  
  async register(createUserDto: CreateUserDto) {
    const userExists = await this.findUserByEmail(createUserDto.email)
    if(userExists) throw new BadRequestException('Email is not available')

    createUserDto.password = await hash(createUserDto.password,10)
    let user = this.userRepository.create(createUserDto);
    user = await this.userRepository.save(user)
    const { password, ...result } = user;
    
    return result;
  }

  async registerGoogle(createGoogleUserDto: CreateGoogleUserDto) {
    const userExists = await this.findUserByEmail(createGoogleUserDto.email)
    if(userExists) throw new BadRequestException('Email is not available')

    createGoogleUserDto.password = await hash(createGoogleUserDto.password,10)
    let user = this.userRepository.create(createGoogleUserDto);
    user = await this.userRepository.save(user)
    const { password, ...result } = user;
    
    return result;
  }

  async updateHashedRefreshToken(userId: string, hashedRefreshToken: string | null ){
      await this.userRepository.update({ id: userId }, { hashedRefreshToken: hashedRefreshToken })
  }

  async getOrderHistory() {
    return `This action returns all users`;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(userId: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ id: userId });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
