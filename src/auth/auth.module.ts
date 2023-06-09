import { Module } from '@nestjs/common'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LocalStrategy } from './auth-strategies/auth.local-strategy'
import { JwtStrategy } from './auth-strategies/jwt.strategy'
import {StaffModule} from "../staff/staff.module";

@Module({
	imports: [
		ConfigModule,
		StaffModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get('SECRET_KEY'),
				signOptions: {
					algorithm: 'HS256',
					expiresIn: `${configService.get(
						'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
					)}s`,
				},
			}),
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
