import {
	Body, ClassSerializerInterceptor,
	Controller,
	HttpCode,
	Post,
	Request, SerializeOptions,
	UseGuards, UseInterceptors,
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import {StaffTypeNames} from "../staff/staff.entity";
import {CreateStaffMemberDto} from "../staff/dto/create-staff.dto";
import {AuthStaffDto} from "../staff/dto/auth-staff.dto";
import {StaffOutDto} from "../staff/dto/staff-out.dto";

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@ApiOperation({ summary: 'Authorization Staff Member' })
	@ApiResponse({ status: 200, description: 'Successfully authorized' })
	@ApiBearerAuth()
	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(@Body() userDto: AuthStaffDto, @Request() req) {
		const accessTokenCookie = this.authService.getCookieWithJwtAccessToken({
			id: req.user.id,
			email: req.user.email,
			name: req.user.name,
		})
		req.res.setHeader('Set-Cookie', accessTokenCookie)
		req.res.sendStatus(200)
	}

	@ApiOperation({ summary: 'Log-Out Staff Member' })
	@ApiResponse({ status: 200, description: 'Successfully logged out' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post('log-out')
	async logout(@Request() req) {
		req.res.setHeader('Set-Cookie', this.authService.getCookieForLogOut())
		req.res.sendStatus(200)
	}

	@ApiOperation({
        summary: "Registration Staff Member",
        description: `"staffTypeName" field can be chosen from: [${Object.values(StaffTypeNames)}]`
    })
	@ApiOperation({ summary: 'Registration Staff Member' })
	@ApiResponse({ status: 200 , type: StaffOutDto})
	@UseInterceptors(ClassSerializerInterceptor)
	@SerializeOptions({ type: StaffOutDto })
	@HttpCode(201)
	@Post('sign-up')
	async registration(@Body() dto: CreateStaffMemberDto) {
		return await this.authService.registration(dto)
	}
}
