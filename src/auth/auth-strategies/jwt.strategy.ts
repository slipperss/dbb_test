import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Request } from 'express'

import { JwtAccessTokenPayload } from '../interfaces/accessTokenPayload'
import {StaffService} from "../../staff/staff.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private staffService: StaffService,
		private configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return request?.cookies?.Authorization
				},
			]),
			ignoreExpiration: false,
			secretOrKey: configService.get('SECRET_KEY'),
		})
	}

	async validate(payload: JwtAccessTokenPayload) {
		const staff = await this.staffService.getStaffMember({
			where: { id: payload.id },
			relations: { supervisor: true, type: true, subordinates: true }
		})
		return staff
	}
}
