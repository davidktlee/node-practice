import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Response } from 'express';
import { UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';
import { LocalAuthGuard } from './guards/local.guard';
import bcrypt from 'bcrypt';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  // @UseGuards(JwtRefreshGuard)
  async login(@Body() userData, @Res({ passthrough: true }) res: Response) {
    const {
      cookieWithAccessToken: { accessToken, ...accessOption },
      cookieWithRefreshToken: { refreshToken, ...refreshOption },
    } = await this.authService.loginUser(userData);
    res.cookie('jwt', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);
    return { accessToken, refreshToken };
  }

  @Post('/signup')
  @ApiCreatedResponse({ type: UserEntity })
  @ApiConflictResponse({})
  // @Redirect('/')
  async signUp(@Body() userData) {
    const { userId, name, phone } = await this.authService.signUp(userData);
    return { userId, name, phone };
  }
  @Get('/authenticate')
  @UseGuards(LocalAuthGuard)
  isAuthenticated(@GetUser() user) {
    return user;
  }
}
