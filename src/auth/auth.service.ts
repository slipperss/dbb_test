import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import * as bcrypt from 'bcryptjs'

import { CreateStaffMemberDto } from '../staff/dto/create-staff.dto'
import { StaffService } from '../staff/staff.service'
import { Staff } from '../staff/staff.entity'
import { ConfigService } from '@nestjs/config'
import { JwtAccessTokenPayload } from './interfaces/accessTokenPayload'

@Injectable()
export class AuthService {
	constructor(
		private staffService: StaffService,
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	async registration(dto: CreateStaffMemberDto) {
		const existing = await this.staffService.getStaffMember({
			where: { email: dto.email },
		})
		if (existing) {
			throw new HttpException(
				'Staff member is already exist!',
				HttpStatus.BAD_REQUEST,
			)
		}
		dto.password = await bcrypt.hash(dto.password, 5)

		return await this.staffService.createStaffMember(dto)
	}

	async validateStaffMember(email: string, password: string): Promise<Staff> {
		const staff = await this.staffService.getStaffMember({
			where: { email: email },
			select: { password: true, email: true, name: true, id: true },
		})
		if (staff) {
			const passwordEquals = await bcrypt.compare(password, staff.password)
			if (passwordEquals) {
				return staff
			}
		}
		return null
	}

	public getCookieWithJwtAccessToken(tokenPayload: JwtAccessTokenPayload) {
		const token = this.jwtService.sign(tokenPayload, {
			expiresIn: `${this.configService.get(
				'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
			)}s`,
		})
		return `Authorization=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
			'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
		)}`
	}
	public getCookieForLogOut() {
		return `Authorization=; HttpOnly; Path=/; Max-Age=0`
	}
}
