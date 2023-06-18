import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Req,
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
import { Request, Response } from 'express';
import { UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';
import { LocalAuthGuard } from './guards/local.guard';
import bcrypt from 'bcrypt';
import { JwtGuard } from './guards/jwt.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(@Body() userData, @Res({ passthrough: true }) res: Response) {
    const {
      cookieWithAccessToken: { accessToken, ...accessOption },
      cookieWithRefreshToken: { refreshToken, ...refreshOption },
    } = await this.authService.loginUser(userData);
    res.cookie('refresh', refreshToken, refreshOption);
    return { userId: userData.userId, token: accessToken };
  }

  @Post('/signup')
  @ApiCreatedResponse({ type: UserEntity })
  @ApiConflictResponse({})
  // @Redirect('/')
  async signUp(@Body() userData): Promise<any> {
    const res = await this.authService.sendSMS(userData.phone);
    // const { userId, name, phone } = await this.authService.signUp(userData);
    // return { userId, name, phone, res };
    /**
     * 지울 것
     */
    return res;
  }
  @Get('/authenticate')
  @UseGuards(JwtGuard)
  isAuthenticated(@Req() req: Request) {
    return { token: req.user };
  }

  @Post('/checkphone')
  async checkPhone(@Body() data): Promise<any> {
    await this.authService.sendSMS(data.phoneNumber);
  }

  @Post('/checkphone/verify')
  async verifyPhone(@Body() data): Promise<any> {
    const res = await this.authService.checkSMS(data);
    if (res) return true;
  }

  @Post('/refresh')
  @UseGuards(JwtRefreshGuard)
  updateRefreshToken(@Req() req: Request) {
    return req.user;
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const { accessOption, refreshOption } =
      await this.authService.removeCookieWithRefreshToken();
    res.cookie('jwt', '', accessOption);
    res.cookie('refresh', '', refreshOption);
  }
}
